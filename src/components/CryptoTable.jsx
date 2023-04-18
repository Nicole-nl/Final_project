import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { visuallyHidden } from "@mui/utils";
import axios from "axios";
import { Typography, TextField, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "market_cap_rank",
    numeric: false,
    label: "Crypto Rank",
  },
  {
    id: "current_price",
    numeric: true,
    label: "Price",
  },
  {
    id: "price_change_percentage_24h",
    numeric: true,
    label: "24h",
  },
  {
    id: "total_volume",
    numeric: true,
    label: "Volume",
  },
  {
    id: "market_cap",
    numeric: true,
    label: "Mkt Cap",
  },
];

const DEFAULT_ORDER = "asc";
const DEFAULT_ORDER_BY = "calories";
const DEFAULT_ROWS_PER_PAGE = 5;

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (newOrderBy) => (event) => {
    onRequestSort(event, newOrderBy);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default function CryptoTable() {
  const [cryptos, setCryptos] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [order, setOrder] = useState(DEFAULT_ORDER);
  const [orderBy, setOrderBy] = useState(DEFAULT_ORDER_BY);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [visibleRows, setVisibleRows] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [paddingHeight, setPaddingHeight] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCryptos();
  }, []);

  const fetchCryptos = async () => {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=aud&order=market_cap_desc&per_page=100&page=1&sparkline=false`
    );
    setCryptos(response.data);
  };
  console.log(111, cryptos);

  const handleSearch = () => {
    if (searchText === "") {
      return cryptos;
    }
    const searchFilter = cryptos.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchText.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchText.toLowerCase())
    );
    return searchFilter;
  };

  useEffect(() => {
    let rowsOnMount = stableSort(
      cryptos,
      getComparator(DEFAULT_ORDER, DEFAULT_ORDER_BY)
    );

    rowsOnMount = rowsOnMount.slice(
      0 * DEFAULT_ROWS_PER_PAGE,
      0 * DEFAULT_ROWS_PER_PAGE + DEFAULT_ROWS_PER_PAGE
    );

    setVisibleRows(rowsOnMount);
  }, [cryptos]);

  const handleRequestSort = useCallback(
    (event, newOrderBy) => {
      const isAsc = orderBy === newOrderBy && order === "asc";
      const toggledOrder = isAsc ? "desc" : "asc";
      setOrder(toggledOrder);
      setOrderBy(newOrderBy);

      const sortedRows = stableSort(
        cryptos,
        getComparator(toggledOrder, newOrderBy)
      );
      const updatedRows = sortedRows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      );

      setVisibleRows(updatedRows);
    },
    [cryptos, order, orderBy, page, rowsPerPage]
  );

  const handleChangePage = useCallback(
    (event, newPage) => {
      setPage(newPage);

      const sortedRows = stableSort(cryptos, getComparator(order, orderBy));
      const updatedRows = sortedRows.slice(
        newPage * rowsPerPage,
        newPage * rowsPerPage + rowsPerPage
      );

      setVisibleRows(updatedRows);

      // Avoid a layout jump when reaching the last page with empty rows.
      const numEmptyRows =
        newPage > 0
          ? Math.max(0, (1 + newPage) * rowsPerPage - cryptos.length)
          : 0;

      const newPaddingHeight = (dense ? 33 : 53) * numEmptyRows;
      setPaddingHeight(newPaddingHeight);
    },
    [order, orderBy, dense, rowsPerPage]
  );

  const handleChangeRowsPerPage = useCallback(
    (event) => {
      const updatedRowsPerPage = parseInt(event.target.value, 10);
      setRowsPerPage(updatedRowsPerPage);

      setPage(0);

      const sortedRows = stableSort(cryptos, getComparator(order, orderBy));
      const updatedRows = sortedRows.slice(
        0 * updatedRowsPerPage,
        0 * updatedRowsPerPage + updatedRowsPerPage
      );

      setVisibleRows(updatedRows);

      // There is no layout jump to handle on the first page.
      setPaddingHeight(0);
    },
    [order, orderBy, cryptos]
  );

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  return (
    <Container sx={{ textAlign: "center", pb: 11 }}>
      <Box sx={{ width: "80%", padding: "20px" }}>
        {new Date().toLocaleDateString("en-GB", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Box>
      <Box sx={{ width: "100%" }}>
        <TextField
          label="Search for cryptocurrency..."
          variant="outlined"
          color="secondary"
          sx={{ width: "100%" }}
          onChange={(e) => setSearchText(e.target.value)}
        ></TextField>
      </Box>

      <Box sx={{ width: "100%" }}>
        <Paper sx={{ width: "100%", mb: 2 }}>
          <TableContainer>
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
              size={dense ? "small" : "medium"}
            >
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                rowCount={cryptos.length}
              />
              <TableBody>
                {stableSort(handleSearch(), getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((crypto, index) => {
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={crypto.name}
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                          navigate(`/cryptos/${crypto.id}`);
                        }}
                      >
                        <TableCell component="th" scope="row" padding="none">
                          <TableCell component="th" scope="row">
                            <Box sx={{ display: "flex" }}>
                              <img
                                src={crypto?.image}
                                alt={crypto.name}
                                height="50"
                                sx={{ mb: 10 }}
                              />
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  pl: 1,
                                  ml: 1,
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  style={{ textTransform: "uppercase" }}
                                >
                                  {crypto.symbol}
                                </Typography>
                                <Typography
                                  variant="body1"
                                  style={{ color: "darkgrey" }}
                                >
                                  {crypto.name}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableCell>
                        <TableCell align="right">
                          $ {crypto.current_price.toFixed(2).toLocaleString()}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              crypto.price_change_percentage_24h > 0
                                ? "green"
                                : "red",
                            fontWeight: "bold",
                            fontSize: 18,
                          }}
                        >
                          {`${
                            crypto.price_change_percentage_24h > 0 ? "+" : ""
                          }${crypto.price_change_percentage_24h.toFixed(2)}%`}
                        </TableCell>
                        <TableCell align="right">
                          $ {parseInt(crypto.total_volume).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          {parseInt(
                            crypto.market_cap.toString().slice(0, -6)
                          ).toLocaleString()}{" "}
                          M
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {paddingHeight > 0 && (
                  <TableRow
                    style={{
                      height: paddingHeight,
                    }}
                  >
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={cryptos.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        <FormControlLabel
          control={<Switch checked={dense} onChange={handleChangeDense} />}
          label="Dense padding"
        />
      </Box>
    </Container>
  );
}
