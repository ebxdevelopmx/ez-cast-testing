import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import type { Cazatalentos, Proyecto, Talentos } from "@prisma/client";
import { FileManager } from "~/utils/file-manager";
import { TipoUsuario } from "~/enums";

function exclude<Talentos, Key extends keyof Talentos>(
	talento: Talentos,
	keys: Key[]
  ): Omit<Talentos, Key> {
	for (const key of keys) {
	  delete talento[key]
	}
	return talento
  }
  // /uploads/talentos/5/fotos-perfil/FOTO_PERFIL/002.png

export const TalentosRouter = createTRPCRouter({
    getAll: publicProcedure
		.query(async ({ ctx }) => {
			return await ctx.prisma.talentos.findMany();
		}
	),
	getById: publicProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input, ctx }) => {
			const talento = await ctx.prisma.talentos.findUnique({
				where: {id: input.id},
				include: {
					info_basica: {
						include: {
							union: true,
						}
					},
					creditos: {
						include: {
							creditos: true
						}
					},
					habilidades: true,
					representante: true,
					redes_sociales: true,
					media: {
						include: {
							media: true
						}
					},
					activos: {
						include: {
							vehiculos: {
								include: {
									tipo_vehiculo: true,
								}
							},
							mascotas: {
								include: {
									tipo_mascota: true,
									raza_mascota: true
								}
							},
							vestuario: {
								include: {
									tipo_vestuario_especifico: {
										include: {
											tipo_vestuario: true
										}
									}
								}
							},
							props: {
								include: {
									tipo_props: true,
								}
							},
							equipo_deportivo: {
								include: {
									tipo_equipo_deportivo: true
								}
							},
							
						}
					}
				}
			});

			// hay que excluir la pass en 
			return talento;
			//return exclude(talento, ['contrasenia'])
		}
	),
  	saveInfoGral: protectedProcedure
    	.input(z.object({ 
			nombre: z.string(),
			union: z.object({
				id: z.number(),
				descripcion: z.string().nullish()
			}),
			id_estado_republica: z.number(),
			edad: z.number(),
			peso: z.number(),
			altura: z.number(),
			biografia: z.string(),
			files: z.object({
				carta_responsiva: z.object({
					base64: z.string(),
					extension: z.string(),
				}).nullish(),
				cv: z.object({
					base64: z.string(),
					extension: z.string(),
				}).nullish(),
				urls: z.object({
					cv: z.string().nullish(),
					carta_responsiva: z.string().nullish()
				})
			}),
			representante: z.object({
				nombre: z.string().min(2),
				email: z.string().email(),
				agencia: z.string().min(2),
				telefono: z.string().min(10).max(10)
			}).nullish(),
			redes_sociales: z.array(z.object({
				nombre: z.string(),
				url: z.string()
			})).nullish()
		}))
		.mutation(async ({ input, ctx }) => {
			const user = ctx.session.user; 
			if (user && user.tipo_usuario === TipoUsuario.TALENTO) {

				if (input.edad < 18 && !input.representante) {
					throw new TRPCError({
						code: 'PRECONDITION_FAILED',
						message: 'Si se es menor de edad el representante es obligatorio',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				if (input.edad < 18 && (!input.files.carta_responsiva && !input.files.urls.carta_responsiva)) {
					throw new TRPCError({
						code: 'PRECONDITION_FAILED',
						message: 'Si se es menor de edad la carta responsiva y el representante son obligatorios',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				const talento = await ctx.prisma.talentos.update({
					where: {id: parseInt(user.id)},
					data: {
						nombre: input.nombre
					}
				})

				if (!talento) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de actualizar el nombre del talento',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				let file_path_cv: string | null = null;
				if (input.files.cv) {
					const save_result = await FileManager.saveFile(`cv.${input.files.cv.extension}`, input.files.cv.base64, `talentos/${user.id}/info-gral/cv/`);
					if (!save_result.error) {
						file_path_cv = save_result.result;
					} 
					if (save_result.error) {
						console.log(save_result.error);
					}
				} else {
					if (input.files && input.files.urls && input.files.urls.cv) {
						file_path_cv = input.files.urls.cv;
					}
				}

				const info_gral = await ctx.prisma.infoBasicaPorTalentos.upsert({
					where: {
						id_talento: parseInt(user.id)
					},
					update: {
						edad: input.edad,
						peso: input.peso,
						altura: input.altura,
						biografia: input.biografia,
						id_estado_republica: input.id_estado_republica,
						url_cv: file_path_cv
					},
					create: {
						edad: input.edad,
						peso: input.peso,
						altura: input.altura,
						biografia: input.biografia,
						id_estado_republica: input.id_estado_republica,
						url_cv: file_path_cv,
						id_talento: parseInt(user.id)
					},
				});

				if (!info_gral) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de guardar la info general del talento',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				const union_por_talento = await ctx.prisma.unionPorInfoBasicaTalento.upsert({
					where: {
						id_info_basica_por_talentos: info_gral.id
					},
					update: {
						id_union: input.union.id,
						descripcion: (input.union.id === 99) ? input.union.descripcion : null
					},
					create: {
						id_union: input.union.id,
						descripcion: (input.union.id === 99) ? input.union.descripcion : null,
						id_info_basica_por_talentos: info_gral.id
					},
				});

				if (!union_por_talento) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de guardar la union del talento',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				const deleted_redes_sociales = await ctx.prisma.redesSocialesPorTalentos.deleteMany({
					where: { 
						id_talento: parseInt(user.id)
					}
				});

				if (!deleted_redes_sociales) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de eliminar las redes sociales del talento',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				if (input.redes_sociales) {
					if (Object.keys(input.redes_sociales).length > 0) {
						const saved_redes_sociales = await ctx.prisma.redesSocialesPorTalentos.createMany({
							data: input.redes_sociales.map(red => { 
								return { nombre: red.nombre, url: red.url, id_talento: parseInt(user.id)} 
							})
						})
						if (!saved_redes_sociales) {
							throw new TRPCError({
								code: 'INTERNAL_SERVER_ERROR',
								message: 'Ocurrio un error al tratar de guardar las redes sociales del talento',
								// optional: pass the original error to retain stack trace
								//cause: theError,
							});
						}
					}
				}

				if (input.edad < 18) {
					if (input.representante) {
						let file_path_carta_responsiva: string | null = null;
						if (input.files.carta_responsiva) {
							const save_result = await FileManager.saveFile(`carta-responsiva.${input.files.carta_responsiva.extension}`, input.files.carta_responsiva.base64, `talentos/${user.id}/info-gral/carta-responsiva/`);
							if (!save_result.error) {
								file_path_carta_responsiva = save_result.result;
							}
						} else {
							if (input.files && input.files.urls && input.files.urls.carta_responsiva) {
								file_path_carta_responsiva = input.files.urls.carta_responsiva;
							}
						}
	
						const saved_representante = await ctx.prisma.representantesPorTalentos.upsert({
							where: {
								id_talento: parseInt(user.id)
							},
							update: {
								url_carta_responsiva: file_path_carta_responsiva,
								nombre: input.representante.nombre,
								agencia: input.representante.agencia,
								email: input.representante.email,
								telefono: input.representante.telefono
							},
							create: {
								nombre: input.representante.nombre,
								agencia: input.representante.agencia,
								email: input.representante.email,
								telefono: input.representante.telefono,
								url_carta_responsiva: file_path_carta_responsiva,
								id_talento: parseInt(user.id)
							},
						});
		
						if (!saved_representante) {
							throw new TRPCError({
								code: 'INTERNAL_SERVER_ERROR',
								message: 'Ocurrio un error al tratar de guardar el representante del talento',
								// optional: pass the original error to retain stack trace
								//cause: theError,
							});
						}
					}
				} else {
					// si es mayor de edad eliminamos al representante
					const deleted_representante = await ctx.prisma.representantesPorTalentos.delete({
						where: {id_talento: parseInt(user.id)}
					})
					if (!deleted_representante) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Ocurrio un problema al tratar de eliminar el representante',
							// optional: pass the original error to retain stack trace
							//cause: theError,
						});
					}
				}
				return info_gral;
			}
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Solo el rol de talento puede modificar la informacion general',
				// optional: pass the original error to retain stack trace
				//cause: theError,
			});
		}
	),
	saveMedios: protectedProcedure
    	.input(z.object({ 
			fotos: z.array(
				z.object({
					base64: z.string(),
					nombre: z.string(),
					identificador: z.string(),
				}
			)),
			videos: z.array(
				z.object({
					base64: z.string(),
					nombre: z.string(),
					identificador: z.string(),
				}
			)),
			audios: z.array(
				z.object({
					base64: z.string(),
					nombre: z.string(),
					identificador: z.string(),
				}
			)),
		}))
		.mutation(async ({ input, ctx }) => {
			console.log('INPUT SAVE MEDIOS: ', input)
			const user = ctx.session.user; 
			if (user && user.tipo_usuario === TipoUsuario.TALENTO) {
				if (input.fotos.length === 0) {
					throw new TRPCError({
						code: 'PRECONDITION_FAILED',
						message: 'Se debe enviar al menos una foto',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}
				
				const media_por_talentos_to_be_deleted = await ctx.prisma.mediaPorTalentos.findMany({
					where: {
						referencia: {
							in: ['FOTOS_PERFIL_TALENTO', 'AUDIOS_TALENTO', 'VIDEOS_TALENTO'],
						},
						id_talento: parseInt(user.id)
					},
					include: {
						media: true
					}
				})
				
				const ids_to_delete = await Promise.all(media_por_talentos_to_be_deleted.map(async (m) => {

					const deleted_file = await FileManager.deleteFile(m.media.path);
					if (deleted_file.error) {
						console.log(deleted_file.error);
					}
					return m.id;
				}));

				await ctx.prisma.mediaPorTalentos.deleteMany({
					where: {
						id: {
							in: ids_to_delete
						}
					}
				});



				/*
					referencia: 'VIDEOS_TALENTO',
					identificador: `VIDEO_${key}`,
					nombre: file.name,
					pathname: `talentos/${this.talento_profile?.id}/videos-perfil/`
				*/
				/*
				if (m.identificador === 'FOTO_PERFIL') {
					if (talento.dataValues.profile_img_url) {
						const deleted_file = await fileManager.deleteFile(talento.dataValues.profile_img_url);
						if (deleted_file.error) {
							throw new Error(deleted_file.error.detailed_msg);
						}
					}
				}
				*/
				if (input.fotos.length > 0) {
					const uploaded_fotos_result = await Promise.all(input.fotos.map(async (foto) => {
						const name_exploded = foto.nombre.split('.');
						const extension = name_exploded[name_exploded.length - 1];
						name_exploded.splice(name_exploded.length - 1);
						if (extension) {

							const name = `${name_exploded.join('_')}.${extension}`;      
							
							const save_result = await FileManager.saveFile(`${foto.identificador}.${extension}`, foto.base64, `talentos/${user.id}/fotos-perfil/`);
							if (!save_result.error) {
								const saved_media = await ctx.prisma.media.create({
									data: {
										nombre: name,
										extension: extension,
										path: save_result.result
									}
								})
								const saved_media_por_talento = await ctx.prisma.mediaPorTalentos.create({
									data: {
										referencia: 'FOTOS_PERFIL',
										identificador: foto.identificador,
										id_media: saved_media.id,
										id_talento: parseInt(user.id)
									}
								})
								return (saved_media_por_talento);
							}
						}
						return false;
					}));
					console.log('saved_fotos', uploaded_fotos_result);
				}

				if (input.audios.length > 0) {
					const uploaded_audios_result = await Promise.all(input.fotos.map(async (audio) => {
						const name_exploded = audio.nombre.split('.');
						const extension = name_exploded[name_exploded.length - 1];
						name_exploded.splice(name_exploded.length - 1);
						if (extension) {

							const name = `${name_exploded.join('_')}.${extension}`;      
							
							const save_result = await FileManager.saveFile(`${audio.identificador}.${extension}`, audio.base64, `talentos/${user.id}/audios-perfil/`);
							if (!save_result.error) {
								const saved_media = await ctx.prisma.media.create({
									data: {
										nombre: name,
										extension: extension,
										path: save_result.result
									}
								})
								const saved_media_por_talento = await ctx.prisma.mediaPorTalentos.create({
									data: {
										referencia: 'AUDIOS_PERFIL',
										identificador: audio.identificador,
										id_media: saved_media.id,
										id_talento: parseInt(user.id)
									}
								})
								return (saved_media_por_talento);
							}
						}
						return false;
					}));
					console.log('saved_audios', uploaded_audios_result);
				}

				if (input.videos.length > 0) {
					const uploaded_videos_result = await Promise.all(input.fotos.map(async (video) => {
						const name_exploded = video.nombre.split('.');
						const extension = name_exploded[name_exploded.length - 1];
						name_exploded.splice(name_exploded.length - 1);
						if (extension) {

							const name = `${name_exploded.join('_')}.${extension}`;      
							
							const save_result = await FileManager.saveFile(`${video.identificador}.${extension}`, video.base64, `talentos/${user.id}/videos-perfil/`);
							if (!save_result.error) {
								const saved_media = await ctx.prisma.media.create({
									data: {
										nombre: name,
										extension: extension,
										path: save_result.result
									}
								})
								const saved_media_por_talento = await ctx.prisma.mediaPorTalentos.create({
									data: {
										referencia: 'VIDEOS_PERFIL',
										identificador: video.identificador,
										id_media: saved_media.id,
										id_talento: parseInt(user.id)
									}
								})
								return (saved_media_por_talento);
							}
						}
						return false;
					}));
					console.log('saved_videos', uploaded_videos_result);
				}
				return true;
			}
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Solo el rol de talento puede modificar la informacion general',
				// optional: pass the original error to retain stack trace
				//cause: theError,
			});
		}
	),
	saveCreditos: protectedProcedure
		.input(z.object({ 
			mostrar_anio_en_perfil: z.boolean(),
			creditos: z.array(z.object({
				id_catalogo_proyecto: z.number(),
				titulo: z.string(),
				rol: z.string(),
				director: z.string(),
				anio: z.number(),
				destacado: z.boolean(),
				clip_url: z.string()
			}))
		}))
		.mutation(async ({ input, ctx }) => {
			const user = ctx.session.user; 
			if (user && user.tipo_usuario === TipoUsuario.TALENTO) {
				const creditos_por_talentos = await ctx.prisma.creditosPorTalentos.upsert({
					where: {
						id_talento: parseInt(user.id)
					},
					update: {
						mostrar_anio_perfil: input.mostrar_anio_en_perfil,
					},
					create: {
						mostrar_anio_perfil: input.mostrar_anio_en_perfil,
						id_talento: parseInt(user.id)
					},
				});

				if (!creditos_por_talentos) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de actualizar los creditos por talentos',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				const deleted_creditos = await ctx.prisma.creditoTalento.deleteMany({
					where: {
						id_creditos_por_talento: creditos_por_talentos.id
					}
				});
				if (!deleted_creditos) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de eliminar los creditos por talentos',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				if (input.creditos.length > 0) {
					const created_creditos = await ctx.prisma.creditoTalento.createMany({
						data: input.creditos.map(credito => {
							return {...credito, id_creditos_por_talento: creditos_por_talentos.id};
						})
					});
		
					if (!created_creditos) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Ocurrio un error al tratar de guardar los creditos por talentos',
							// optional: pass the original error to retain stack trace
							//cause: theError,
						});
					}
				}

				return creditos_por_talentos;
			}
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Solo el rol de talento puede modificar los creditos',
				// optional: pass the original error to retain stack trace
				//cause: theError,
			});
		}
	),
	saveHabilidades: protectedProcedure
		.input(z.object({ 
			ids_habilidades: z.array(z.object({
				id_habilidad: z.number(),
				id_habilidad_especifica: z.number()
			})),
		}))
		.mutation(async ({ input, ctx }) => {
			const user = ctx.session.user; 
			if (user && user.tipo_usuario === TipoUsuario.TALENTO) {
				
				const deleted_habilidades = await ctx.prisma.habilidadesPorTalentos.deleteMany({
					where: {
						id_talento: parseInt(user.id)
					}
				});
				if (!deleted_habilidades) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de eliminar las habilidades por talentos',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				if (input.ids_habilidades.length > 0) {
					const saved_habilidades = await ctx.prisma.habilidadesPorTalentos.createMany({
						data: input.ids_habilidades.map(entry => { return { ...entry, id_talento: parseInt(user.id)}})
					});
					if (!saved_habilidades) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Ocurrio un error al tratar de guardar las habilidades por talentos',
							// optional: pass the original error to retain stack trace
							//cause: theError,
						});
					}
				}
				return true;
			}
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Solo el rol de talento puede modificar las habilidades',
				// optional: pass the original error to retain stack trace
				//cause: theError,
			});
		}
	),
	saveActivos: protectedProcedure
		.input(z.object({ 
			vehiculos: z.array(z.object({
				id_tipo_vehiculo: z.number(),
				marca: z.string(),
				modelo: z.string(),
				color: z.string(),
				anio: z.number()
			})),
			mascotas: z.array(z.object({
				id_tipo_mascota: z.number(),
				id_raza: z.number().nullish(),
				tamanio: z.string(),
			})),
			vestuarios: z.array(z.object({
				id_tipo_vestuario_especifico: z.number(),
				descripcion: z.string(),
			})),
			props: z.array(z.object({
				id_tipo_props: z.number(),
				descripcion: z.string(),
			})),
			equipos_deportivos: z.array(z.object({
				id_tipo_equipo_deportivo: z.number(),
				descripcion: z.string(),
			})),
		}))
		.mutation(async ({ input, ctx }) => {
			const user = ctx.session.user; 
			if (user && user.tipo_usuario === TipoUsuario.TALENTO) {
				
				const activos_por_talento = await ctx.prisma.activosPorTalentos.upsert({
					where: {id_talento: parseInt(user.id)},
					update: { },
					create: {
						id_talento: parseInt(user.id)
					}
				});
				
				if (!activos_por_talento) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de obtener los activos por talento',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}
				
				const deleted_vehiculos = await ctx.prisma.vehiculoTalento.deleteMany({
					where: {
						id_activos_talentos: activos_por_talento.id
					}
				});
				if (!deleted_vehiculos) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de eliminar los vehiculos por talentos',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				if (input.vehiculos.length > 0) {
					const saved_vehiculos = await ctx.prisma.vehiculoTalento.createMany({
						data: input.vehiculos.map(entry => { return { ...entry, id_activos_talentos: activos_por_talento.id}})
					});
					if (!saved_vehiculos) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Ocurrio un error al tratar de guardar los vehiculos por talentos',
							// optional: pass the original error to retain stack trace
							//cause: theError,
						});
					}
				}

				const deleted_mascotas = await ctx.prisma.mascotaTalento.deleteMany({
					where: {
						id_activos_talentos: activos_por_talento.id
					}
				});
				if (!deleted_mascotas) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de eliminar las mascotas por talentos',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				if (input.mascotas.length > 0) {
					const saved_mascotas = await ctx.prisma.mascotaTalento.createMany({
						data: input.mascotas.map(entry => { return { ...entry, id_activos_talentos: activos_por_talento.id, id_raza: (entry.id_raza && entry.id_raza > 0) ? entry.id_raza : null }})
					});
					if (!saved_mascotas) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Ocurrio un error al tratar de guardar las mascotas por talentos',
							// optional: pass the original error to retain stack trace
							//cause: theError,
						});
					}
				}

				const deleted_vestuarios = await ctx.prisma.vestuarioTalento.deleteMany({
					where: {
						id_activos_talentos: activos_por_talento.id
					}
				});
				if (!deleted_vestuarios) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de eliminar los vestuarios por talentos',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				if (input.vestuarios.length > 0) {
					const saved_vestuarios = await ctx.prisma.vestuarioTalento.createMany({
						data: input.vestuarios.map(entry => { return { ...entry, id_activos_talentos: activos_por_talento.id}})
					});
					if (!saved_vestuarios) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Ocurrio un error al tratar de guardar los vestuarios por talentos',
							// optional: pass the original error to retain stack trace
							//cause: theError,
						});
					}
				}

				const deleted_props = await ctx.prisma.propsTalento.deleteMany({
					where: {
						id_activos_talentos: activos_por_talento.id
					}
				});
				if (!deleted_props) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de eliminar los props por talentos',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				if (input.props.length > 0) {
					const saved_props = await ctx.prisma.propsTalento.createMany({
						data: input.props.map(entry => { return { ...entry, id_activos_talentos: activos_por_talento.id}})
					});
					if (!saved_props) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Ocurrio un error al tratar de guardar los props por talentos',
							// optional: pass the original error to retain stack trace
							//cause: theError,
						});
					}
				}

				const deleted_equipos_deportivos = await ctx.prisma.equipoDeportivoTalento.deleteMany({
					where: {
						id_activos_talentos: activos_por_talento.id
					}
				});
				if (!deleted_equipos_deportivos) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de eliminar los equipos deportivos por talentos',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				if (input.equipos_deportivos.length > 0) {
					const saved_equipos_deportivos = await ctx.prisma.equipoDeportivoTalento.createMany({
						data: input.equipos_deportivos.map(entry => { return { ...entry, id_activos_talentos: activos_por_talento.id}})
					});
					if (!saved_equipos_deportivos) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Ocurrio un error al tratar de guardar los equipos deportivos por talentos',
							// optional: pass the original error to retain stack trace
							//cause: theError,
						});
					}
				}
				return activos_por_talento;
			}
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Solo el rol de talento puede modificar las habilidades',
				// optional: pass the original error to retain stack trace
				//cause: theError,
			});
		}
	),
	savePreferencias: protectedProcedure
		.input(z.object({ 
			preferencias: z.object({
				interesado_en_trabajos_de_extra: z.boolean(),
				nombre_agente: z.string().nullish(),
				contacto_agente: z.string().nullish(),
				meses_embarazo: z.number().nullish()
			}),
			tipos_trabajo: z.array(z.number()),
			interes_en_proyectos: z.array(z.number()),
			locaciones: z.array(z.object({
				es_principal: z.boolean(),
  				id_estado_republica: z.number()
			})),
			documentos: z.array(z.object({
				id_documento: z.number(),
				descripcion: z.string()
			})),
			disponibilidad: z.array(z.number()), 
			otras_profesiones: z.array(z.string()),
		}))
		.mutation(async ({ input, ctx }) => {
			const user = ctx.session.user; 
			if (user && user.tipo_usuario === TipoUsuario.TALENTO) {
				const preferencias = await ctx.prisma.preferenciasPorTalentos.upsert({
					where: {id_talento: parseInt(user.id)},
					update: {
						interesado_en_trabajos_de_extra: input.preferencias.interesado_en_trabajos_de_extra,
						nombre_agente: input.preferencias.nombre_agente,
						contacto_agente: input.preferencias.contacto_agente,
						meses_embarazo: input.preferencias.meses_embarazo,
					},
					create: {
						interesado_en_trabajos_de_extra: input.preferencias.interesado_en_trabajos_de_extra,
						nombre_agente: input.preferencias.nombre_agente,
						contacto_agente: input.preferencias.contacto_agente,
						meses_embarazo: input.preferencias.meses_embarazo,
						id_talento: parseInt(user.id)
					}
				})

				const deleted_tipos_de_trabajos = await ctx.prisma.tiposDeTrabajoPorTalentos.deleteMany({
					where: {
						id_preferencias_por_talentos: preferencias.id
					}
				});

				if (!deleted_tipos_de_trabajos) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de eliminar los tipos de trabajos por talentos',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				} 

				if (input.tipos_trabajo.length > 0) {
					const saved_tipos_de_trabajo = await ctx.prisma.tiposDeTrabajoPorTalentos.createMany({
						data: input.tipos_trabajo.map(tdt => { return {id_tipo_de_trabajo: tdt, id_preferencias_por_talentos: preferencias.id }})
					})

					if (!saved_tipos_de_trabajo) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Ocurrio un error al tratar de guardar los tipos de trabajos por talentos',
							// optional: pass the original error to retain stack trace
							//cause: theError,
						});
					} 
				}

				const deleted_intereses_en_proyectos = await ctx.prisma.interesEnProyectosPorTalentos.deleteMany({
					where: {
						id_preferencias_por_talentos: preferencias.id
					}
				})

				if (!deleted_intereses_en_proyectos) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de eliminar los intereses por proyecto por talentos',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}
				
				if (input.interes_en_proyectos.length > 0) {
					const saved_intereses_en_proyectos = await ctx.prisma.interesEnProyectosPorTalentos.createMany({
						data: input.interes_en_proyectos.map(e => { return {id_interes_en_proyecto: e, id_preferencias_por_talentos: preferencias.id }})
					})
	
					if (!saved_intereses_en_proyectos) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Ocurrio un error al tratar de guardar los intereses en proyectos por talentos',
							// optional: pass the original error to retain stack trace
							//cause: theError,
						});
					}
				}

				const deleted_locaciones = await ctx.prisma.locacionesPrerenciasPorTalentos.deleteMany({
					where: {
						id_preferencias_por_talentos: preferencias.id
					}
				})

				if (!deleted_locaciones) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de eliminar las locaciones por talentos',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				if (input.locaciones.length > 0) {
					const saved_locaciones = await ctx.prisma.locacionesPrerenciasPorTalentos.createMany({
						data: input.locaciones.map(e => { return { id_estado_republica: e.id_estado_republica, es_principal: e.es_principal, id_preferencias_por_talentos: preferencias.id } })
					})

					if (!saved_locaciones) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Ocurrio un error al tratar de guardar las locaciones por talentos',
							// optional: pass the original error to retain stack trace
							//cause: theError,
						});
					}
				}
				
				const deleted_documentos = await ctx.prisma.documentosPorTalentos.deleteMany({
					where: {
						id_preferencias_por_talentos: preferencias.id
					}
				})

				if (!deleted_documentos) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de eliminar los documentos solicitados por talentos',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				if (input.documentos.length > 0) {
					const saved_documentos = await ctx.prisma.documentosPorTalentos.createMany({
						data: input.documentos.map(e => { return { id_documento: e.id_documento, descripcion: e.descripcion, id_preferencias_por_talentos: preferencias.id } })
					})

					if (!saved_documentos) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Ocurrio un error al tratar de guardar los documentos solicitados por talentos',
							// optional: pass the original error to retain stack trace
							//cause: theError,
						});
					}
				}

				const deleted_disponibilidad = await ctx.prisma.disponibilidadesPorTalentos.deleteMany({
					where: {
						id_preferencias_por_talentos: preferencias.id
					}
				})

				if (!deleted_disponibilidad) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de eliminar las disponibilidades por talentos',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				if (input.disponibilidad.length > 0) {
					const saved_disponibilidad = await ctx.prisma.disponibilidadesPorTalentos.createMany({
						data: input.documentos.map(e => { return { id_disponibilidad: e.id_documento, descripcion: e.descripcion, id_preferencias_por_talentos: preferencias.id } })
					})

					if (!saved_disponibilidad) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Ocurrio un error al tratar de guardar las disponibilidades por talentos',
							// optional: pass the original error to retain stack trace
							//cause: theError,
						});
					}
				}

				const deleted_otras_profesiones = await ctx.prisma.otrasProfesionesPorTalentos.deleteMany({
					where: {
						id_preferencias_por_talentos: preferencias.id
					}
				})

				if (!deleted_otras_profesiones) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Ocurrio un error al tratar de eliminar las otras profesiones por talentos',
						// optional: pass the original error to retain stack trace
						//cause: theError,
					});
				}

				if (input.otras_profesiones.length > 0) {
					const saved_otras_profesiones = await ctx.prisma.otrasProfesionesPorTalentos.createMany({
						data: input.otras_profesiones.map(e => { return { descripcion: e, id_preferencias_por_talentos: preferencias.id } })
					})

					if (!saved_otras_profesiones) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Ocurrio un error al tratar de guardar las otras profesiones por talentos',
							// optional: pass the original error to retain stack trace
							//cause: theError,
						});
					}
				}
				return preferencias;
			}
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Solo el rol de talento puede modificar las habilidades',
				// optional: pass the original error to retain stack trace
				//cause: theError,
			});
		}
	),
	
});