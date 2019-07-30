import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import "./styles.css";
import { withStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Paper,
  TableSortLabel,
  Typography,
  TextField,
  Image
} from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import TablePagination from "@material-ui/core/TablePagination";
import { withApollo } from "react-apollo";

const styles = theme => ({
  root: {
    maxWidth: 1000,
    marginTop: theme.spacing.unit * 3,
    overflowX: "auto",
    margin: "auto"
  },
  table: {
    minWidth: 1000
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    minWidth: 300,
    height: 50,
    fontSize: "2em"
  }
});

const TOTAL_COUNT_QUERY = gql`
  query moneyFlow($orderBy: [_MoneyFlowOrdering], $filter: _MoneyFlowFilter) {
    moneyFlow(orderBy: $orderBy, filter: $filter) {
      fromCountry
    }
  }
`;

const QUERY = gql`
  query moneyFlow($orderBy: [_MoneyFlowOrdering], $filter: _MoneyFlowFilter) {
    moneyFlow(orderBy: $orderBy, filter: $filter) {
      fromCountry
      fromCountryImage
      toCountry
      toCountryImage
      totalFees
      player
      playerImage
      fee
    }
  }
`;

class MoneyInMoneyOut extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      order: "desc",
      orderBy: "totalFees",
      page: 0,
      rowsPerPage: 10,
      totalCount: 0,
      countryFilter: "",
      fromClubFilter: "",
      toClubFilter: ""
    };
  }

  handleSortRequest = property => {
    const orderBy = property;
    let order = "desc";

    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    this.setState({ order, orderBy, page: 0 });
  };

  handleFilterChange = filterName => event => {
    const val = event.target.value;

    this.setState({
      [filterName]: val,
      page: 0
    });
  };

  getFromCountryFilter = () => {
    return { fromCountry_contains: this.state.fromCountryFilter };
  };

  getToCountryFilter = () => {
    return { toCountry_contains: this.state.toCountryFilter };
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  handleChangePage = (event, newPage) => {
    this.setState({ page: newPage });
  };

  componentDidMount() {
    this.updateTotalRowCount();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.countryFilter !== prevState.countryFilter) {
      this.updateTotalRowCount();
    }
  }

  updateTotalRowCount() {
    const filter = {
      AND: [this.getFromCountryFilter(), this.getToCountryFilter()]
    };
    this.props.client
      .query({
        query: TOTAL_COUNT_QUERY,
        variables: {
          filter: filter,
          orderBy: this.state.orderBy + "_" + this.state.order
        }
      })
      .then(result => {
        const data = result.data;
        if (data && data.moneyFlow) {
          this.handleCount(data.moneyFlow.length);
        }
      });
  }

  handleCount = count => {
    this.setState({ totalCount: count });
  };

  render() {
    const { order, orderBy } = this.state;
    const { classes } = this.props;

    return (
      <Paper className={classes.root}>
        <Typography variant="h2" style={{ padding: "7px" }} gutterBottom>
          Money Flow
        </Typography>
        <TextField
          id="search"
          label="Country"
          className={classes.textField}
          value={this.state.countryFilter}
          onChange={this.handleFilterChange("countryFilter")}
          margin="normal"
          variant="outlined"
          type="text"
          InputProps={{
            className: classes.input
          }}
        />

        <Query
          query={QUERY}
          variables={{
            first: this.state.rowsPerPage,
            offset: this.state.rowsPerPage * this.state.page,
            filter: {
              AND: [this.getFromCountryFilter(), this.getToCountryFilter()]
            },
            orderBy: this.state.orderBy + "_" + this.state.order
          }}
        >
          {({ loading, error, data }) => {
            if (loading) return <p style={{ padding: "7px" }}>Loading...</p>;
            if (error) return <p style={{ padding: "7px" }}>Error</p>;

            return (
              <div>
                <Table className={this.props.classes.table}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        key="fromCountry"
                        sortDirection={
                          orderBy === "fromCountry" ? order : false
                        }
                        colSpan={2}
                      >
                        From Country
                      </TableCell>
                      <TableCell
                        key="toCountry"
                        sortDirection={orderBy === "toCountry" ? order : false}
                        colSpan={2}
                      >
                        To Country
                      </TableCell>
                      <TableCell
                        key="totalFees"
                        sortDirection={orderBy === "totalFees" ? order : false}
                      >
                        <Tooltip
                          title="Sort"
                          placement="bottom-start"
                          enterDelay={300}
                        >
                          <TableSortLabel
                            active={orderBy === "totalFees"}
                            direction={order}
                            onClick={() => this.handleSortRequest("totalFees")}
                          >
                            Total Fees
                          </TableSortLabel>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        key="moneyReceived"
                        sortDirection={
                          orderBy === "moneyReceived" ? order : false
                        }
                      >
                        <Tooltip
                          title="Sort"
                          placement="bottom-start"
                          enterDelay={300}
                        >
                          <TableSortLabel
                            active={orderBy === "moneyReceived"}
                            direction={order}
                            onClick={() =>
                              this.handleSortRequest("moneyReceived")
                            }
                          >
                            Amount Received
                          </TableSortLabel>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        key="profit"
                        sortDirection={orderBy === "profit" ? order : false}
                      >
                        <Tooltip
                          title="Sort"
                          placement="bottom-start"
                          enterDelay={300}
                        >
                          <TableSortLabel
                            active={orderBy === "profit"}
                            direction={order}
                            onClick={() => this.handleSortRequest("profit")}
                          >
                            Profit
                          </TableSortLabel>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.moneyFlow.map(n => {
                      return (
                        <TableRow key={n.fromCountry + "_" + n.toCountry}>
                          <TableCell padding={"checkbox"}>
                            {n.fromCountryImage ? (
                              <Avatar
                                style={{ width: 20, height: 20 }}
                                alt={n.fromCountry}
                                src={n.fromCountryImage.replace(
                                  "tiny",
                                  "medium"
                                )}
                              />
                            ) : null}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {n.fromCountry}
                          </TableCell>
                          <TableCell padding={"checkbox"}>
                            {n.toCountryImage ? (
                              <Avatar
                                style={{ width: 20, height: 20 }}
                                alt={n.toCountry}
                                src={n.toCountryImage.replace("tiny", "medium")}
                              />
                            ) : null}
                          </TableCell>
                          <TableCell>{n.toCountry}</TableCell>
                          <TableCell>
                            {n.totalFees.toLocaleString("en-US", {
                              style: "currency",
                              currency: "GBP",
                              minimumFractionDigits: 0
                            })}
                          </TableCell>
                          <TableCell>{n.player}</TableCell>
                          <TableCell>
                            {n.fee.toLocaleString("en-US", {
                              style: "currency",
                              currency: "GBP",
                              minimumFractionDigits: 0
                            })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  component="div"
                  count={this.state.totalCount}
                  rowsPerPage={this.state.rowsPerPage}
                  page={this.state.page}
                  backIconButtonProps={{
                    "aria-label": "previous page"
                  }}
                  nextIconButtonProps={{
                    "aria-label": "next page"
                  }}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
              </div>
            );
          }}
        </Query>
      </Paper>
    );
  }
}

export default withStyles(styles)(withApollo(MoneyInMoneyOut));
