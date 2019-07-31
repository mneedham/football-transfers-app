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

import { ArrowLeft, ArrowRight } from "@material-ui/icons";

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
  query moneyFlow($orderBy: [_MoneyFlowOrdering], $country: String) {
    moneyFlow(orderBy: $orderBy, countrySubstring: $country) {
      fromCountry
    }
  }
`;

const QUERY = gql`
  query moneyFlow(
    $orderBy: [_MoneyFlowOrdering]
    $country: String
    $first: Int
    $offset: Int
  ) {
    moneyFlow(
      orderBy: $orderBy
      countrySubstring: $country
      first: $first
      offset: $offset
    ) {
      fromCountry
      fromCountryImage
      toCountry
      toCountryImage
      totalFees
      country1Country2
      country2Country1
    }
  }
`;

class MoneyFlow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      order: "desc",
      orderBy: "totalFees",
      page: 0,
      rowsPerPage: 10,
      totalCount: 0,
      countryFilter: ""
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
    this.props.client
      .query({
        query: TOTAL_COUNT_QUERY,
        variables: {
          country: this.state.countryFilter,
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
          Country Money Flow
        </Typography>
        <TextField
          id="country"
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
            country: this.state.countryFilter,
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
                      >
                        <Tooltip
                          title="Sort"
                          placement="bottom-start"
                          enterDelay={300}
                        >
                          <TableSortLabel
                            active={orderBy === "fromCountry"}
                            direction={order}
                            onClick={() =>
                              this.handleSortRequest("fromCountry")
                            }
                          >
                            Country 1
                          </TableSortLabel>
                        </Tooltip>
                      </TableCell>

                      <TableCell
                        key="country1Country2"
                        sortDirection={
                          orderBy === "country1Country2" ? order : false
                        }
                        align={"right"}
                      >
                        Money Flow
                      </TableCell>

                      <TableCell
                        key="toCountry"
                        sortDirection={orderBy === "toCountry" ? order : false}
                        align={"right"}
                      >
                        <Tooltip
                          title="Sort"
                          placement="bottom-start"
                          enterDelay={300}
                        >
                          <TableSortLabel
                            active={orderBy === "toCountry"}
                            direction={order}
                            onClick={() => this.handleSortRequest("toCountry")}
                          >
                            Country 2
                          </TableSortLabel>
                        </Tooltip>
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
                            Total Money Flow
                          </TableSortLabel>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.moneyFlow.map(n => {
                      return (
                        <TableRow key={n.fromCountry + "_" + n.toCountry}>
                          <TableCell align={"left"}>
                            <div>
                              {n.fromCountryImage ? (
                                <Avatar
                                  style={{
                                    width: 20,
                                    height: 20,
                                    verticalAlign: "middle",
                                    display: "inline-block",
                                    marginRight: "8px"
                                  }}
                                  alt={n.fromCountry}
                                  src={n.fromCountryImage.replace(
                                    "tiny",
                                    "medium"
                                  )}
                                />
                              ) : null}

                              {n.fromCountry}
                            </div>
                          </TableCell>

                          <TableCell align={"right"}>
                            <div>
                              {n.country1Country2.toLocaleString("en-US", {
                                style: "currency",
                                currency: "GBP",
                                minimumFractionDigits: 0
                              })}{" "}
                              <ArrowRight style={{ verticalAlign: "middle" }} />
                            </div>

                            <div>
                              {n.country2Country1.toLocaleString("en-US", {
                                style: "currency",
                                currency: "GBP",
                                minimumFractionDigits: 0
                              })}{" "}
                              <ArrowLeft style={{ verticalAlign: "middle" }} />
                            </div>
                          </TableCell>

                          <TableCell align={"right"}>
                            <div>
                              {n.toCountry}
                              {n.toCountryImage ? (
                                <Avatar
                                  style={{
                                    width: 20,
                                    height: 20,
                                    verticalAlign: "middle",
                                    display: "inline-block",
                                    marginLeft: "8px"
                                  }}
                                  alt={n.toCountry}
                                  src={n.toCountryImage.replace(
                                    "tiny",
                                    "medium"
                                  )}
                                />
                              ) : null}
                            </div>
                          </TableCell>

                          <TableCell>
                            {n.totalFees.toLocaleString("en-US", {
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

export default withStyles(styles)(withApollo(MoneyFlow));
