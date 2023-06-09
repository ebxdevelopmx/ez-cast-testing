import { TableCell, TableRow, TableContainer, Paper, Table, TableHead, TableBody, TablePagination, Skeleton, TableFooter, Accordion, AccordionSummary, Typography, AccordionDetails, IconButton } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type CSSProperties, type FC, useRef } from "react";
import MotionDiv from "~/components/layout/MotionDiv";
import classes from './MTable.module.css';
import { ExpandMore } from "@mui/icons-material";
import { MContainer } from "~/components/layout/MContainer";
import UpIcon from '@mui/icons-material/KeyboardArrowUp';
import DownIcon from '@mui/icons-material/KeyboardArrowDown';

type MRow = { [key: string]: number | string | boolean | JSX.Element };


interface MTableProps {
	data: MRow[],
	loading?: boolean,
	style?: CSSProperties;
	columnsHeader?: JSX.Element[],
	headerStyles?: CSSProperties,
	headerClassName?: string,
	backgroundColorHeader?: string,
	backgroundColorData?: string,
	disable_animation?: boolean,
	alternate_colors?: boolean,
	styleHeaderRow?: CSSProperties,
	styleHeaderTableCell?: CSSProperties,
	styleTableRow?: CSSProperties,
	accordionContent?: (element_index: number, container_width: number) => JSX.Element | null,
	noDataContent?: JSX.Element
}



export const MTable: FC<MTableProps> = ({
	noDataContent, accordionContent, disable_animation, loading, data, columnsHeader, headerClassName, headerStyles, backgroundColorData = '#ededed ',
	backgroundColorHeader = '#EBEBEB', style = {}, alternate_colors = true, styleHeaderRow = {}, styleHeaderTableCell = {}, styleTableRow = {}
}) => {
	const [pagination, setPagination] = useState<{ page: number, page_size: number }>({ page: 0, page_size: 5 });
	const [expanded_rows, setExpandedRows] = useState<string[]>([]);
	const _data = useMemo(() => {
		if (loading && columnsHeader) {
			return Array.from({ length: 5 }).map((n, i) => {
				return columnsHeader.map((c, j) => {
					return <Skeleton key={j} className="my-2 p-3" variant="rectangular" height={32} />
				})
			})
		} else {
			return data;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, loading]);

	const paginated_data = useMemo(() => {
		const start = (pagination.page * pagination.page_size);
		const end = (pagination.page * pagination.page_size) + pagination.page_size;
		const sliced_data = _data.slice(start, end);
		if (sliced_data.length === 0 && pagination.page > 0) {
			setPagination(v => { return { ...v, page: v.page - 1 } });
		}
		return sliced_data;
	}, [pagination, _data]);

	const table_body_ref = useRef<HTMLTableSectionElement>(null);

	const accordion_content_width = useMemo(() => {
		console.log('xdxd')
		if (table_body_ref.current) {
			return table_body_ref.current.getBoundingClientRect().width;
		}
		return 0;
	}, [table_body_ref.current]);

	console.log(accordion_content_width)

	return (
		<AnimatePresence>
			<TableContainer component={Paper} style={{ ...style, overflowY: 'hidden' }}>
				<Table sx={{ minWidth: 700 }} aria-label="customized table" size="small">
					{
						columnsHeader &&
						<TableHead
							className={classes[(headerClassName) ? headerClassName : '']}
							style={{ ...headerStyles, backgroundColor: backgroundColorHeader }}
						>
							<TableRow sx={{ styleHeaderRow }}>
								{columnsHeader &&
									columnsHeader.map((c, i) => (
										<TableCell align="center" sx={{ ...styleHeaderTableCell, color: '#000' }} key={i}>{c}</TableCell>)
									)
								}
							</TableRow>
						</TableHead>
					}

					<TableBody ref={table_body_ref}>

						{_data.length > 0 && paginated_data.map((row, i) => {

							const row_values = Object.entries(row);
							return (
								<>

									{!disable_animation &&

										<motion.tr
											style={{
												backgroundColor: alternate_colors
													? ((i % 2) ? backgroundColorData : 'white')
													: backgroundColorData,
												...styleTableRow
											}}
											key={i}
											layout={true}
											onClick={() => {
												if (accordionContent) {
													setExpandedRows(prev => {
														if (prev.includes(`panel${i}`)) {
															return prev.filter(p => p !== `panel${i}`);
														}
														return prev.concat([`panel${i}`]);
													})
												}
											}}
											initial={{ opacity: 0, y: 100 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 15 }}
											transition={{ opacity: 0.2, y: 0.3 }}
										>
											{row_values.map((val, i) => {
												if (i === 0) {
													return (
														<TableCell
															style={{ padding: 8 }}
															key={i}
															align='center'
															component="th"
															scope="row"
														>
															{val[1]}
														</TableCell>
													)
												}
												return <TableCell key={i} align='center'>{val[1]}</TableCell>
											})}
										</motion.tr>
									}
									{disable_animation &&
										<TableRow style={{
											...styleTableRow,
											position: 'relative',
											backgroundColor: alternate_colors
												? ((i % 2) ? backgroundColorData : 'white')
												: backgroundColorData,
										}}>
											{row_values.map((val, i) => {
												if (i === 0) {
													return (
														<TableCell
															style={{ padding: 8 }}
															key={i}
															align='center'
															component="th"
															scope="row"
														>
															{val[1]}
														</TableCell>
													)
												}
												return <TableCell key={i} align='center'>{val[1]}</TableCell>
											})}

										</TableRow>
									}
									<TableRow style={{ ...styleTableRow, borderWidth: 1, borderColor: 'gray', borderStyle: (accordionContent != null && expanded_rows.includes(`panel${i}`)) ? 'solid' : 'unset' }}>
										<MotionDiv show={accordionContent != null && expanded_rows.includes(`panel${i}`)} animation="fade">
											<div style={{ position: 'relative', width: 100 }}>
												<div style={{ position: 'absolute', width: accordion_content_width - 8 }}>
													<IconButton onClick={() => {
														setExpandedRows(prev => {
															if (prev.includes(`panel${i}`)) {
																return prev.filter(p => p !== `panel${i}`);
															}
															return prev.concat([`panel${i}`]);
														})
													}} style={{ position: 'absolute', width: 16, top: -8, right: 8 }} color="primary" aria-label="expandir" component="label">
														{(expanded_rows.includes(`panel${i}`)) ? <DownIcon sx={{ color: '#928F8F' }} /> : <UpIcon sx={{ color: '#928F8F' }} />}
													</IconButton>
												</div>
												{accordionContent && accordionContent(i, accordion_content_width - 8)}
											</div>
										</MotionDiv>

									</TableRow>
								</>
							)
						})}
						{_data.length === 0 &&
							<>
								{!noDataContent &&
									<TableRow>
										<TableCell align='left' component="th" scope="row">
											<Typography fontSize={'1.2rem'} fontWeight={600} component={'p'}>
												No hay registros
											</Typography>
										</TableCell>
									</TableRow>
								}
							</>

						}

					</TableBody>
				</Table>
				{noDataContent &&
					noDataContent
				}
			</TableContainer>
			<MotionDiv show={_data.length > 5} animation={'fade'} style={{ backgroundColor: '#069cb1', width: '100%' }}>
				<TablePagination
					sx={{ backgroundColor: '#069cb1' }}
					labelRowsPerPage={'Registros por pagina'}
					component="div"
					count={_data.length}
					page={pagination.page}
					rowsPerPageOptions={[1, 3, 5, 10, 15, 20]}
					onPageChange={(e, page) => { setPagination({ ...pagination, page: page }) }}
					rowsPerPage={pagination.page_size}
					onRowsPerPageChange={(e) => { setPagination({ ...pagination, page_size: parseInt(e.target.value) }) }}
				/>
			</MotionDiv>
		</AnimatePresence>
	)
}