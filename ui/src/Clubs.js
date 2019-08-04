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
import Link from "@material-ui/core/Link";

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
  query topSpendingQuery($country: String, $orderBy: [_SpendingOrdering]) {
    spendingByClub(countrySubstring: $country, orderBy: $orderBy) {
      club
    }
  }
`;

const QUERY = gql`
  query topSpendingQuery(
    $country: String
    $orderBy: [_SpendingOrdering]
    $first: Int
    $offset: Int
  ) {
    spendingByClub(
      countrySubstring: $country
      orderBy: $orderBy
      first: $first
      offset: $offset
    ) {
      moneySpent
      country
      club
      clubImage
      countryImage
      moneyReceived
      profit
    }
  }
`;

class Clubs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      order: "desc",
      orderBy: "moneySpent",
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
        if (data && data.spendingByClub) {
          this.handleCount(data.spendingByClub.length);
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
          Club Spending
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
                        key="club"
                        sortDirection={orderBy === "club" ? order : false}
                      >
                        Club
                      </TableCell>
                      <TableCell
                        key="country"
                        sortDirection={orderBy === "country" ? order : false}
                      >
                        Country
                      </TableCell>
                      <TableCell
                        key="moneySpent"
                        sortDirection={orderBy === "moneySpent" ? order : false}
                      >
                        <Tooltip
                          title="Sort"
                          placement="bottom-start"
                          enterDelay={300}
                        >
                          <TableSortLabel
                            active={orderBy === "moneySpent"}
                            direction={order}
                            onClick={() => this.handleSortRequest("moneySpent")}
                          >
                            Amount Spent
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
                    {data.spendingByClub.map(n => {
                      return (
                        <TableRow key={n.club}>
                          <TableCell align={"left"}>
                            <div>
                              {n.clubImage ? (
                                <Avatar
                                  style={{
                                    width: 20,
                                    height: 20,
                                    verticalAlign: "middle",
                                    display: "inline-block",
                                    marginRight: "8px"
                                  }}
                                  alt={n.club}
                                  src={n.clubImage.replace("tiny", "medium")}
                                />
                              ) : null}

                              <Link href={"/club-spending/" + n.club}>
                                {n.club}
                              </Link>
                            </div>
                          </TableCell>

                          <TableCell align={"left"}>
                            <div>
                              {n.countryImage ? (
                                <Avatar
                                  style={{
                                    width: 20,
                                    height: 20,
                                    verticalAlign: "middle",
                                    display: "inline-block",
                                    marginRight: "8px"
                                  }}
                                  alt={n.country}
                                  src={n.countryImage.replace("tiny", "medium")}
                                />
                              ) : null}

                              {n.country}
                            </div>
                          </TableCell>

                          <TableCell>
                            {n.moneySpent.toLocaleString("en-US", {
                              style: "currency",
                              currency: "GBP",
                              minimumFractionDigits: 0
                            })}
                          </TableCell>
                          <TableCell>
                            {n.moneyReceived.toLocaleString("en-US", {
                              style: "currency",
                              currency: "GBP",
                              minimumFractionDigits: 0
                            })}
                          </TableCell>
                          <TableCell>
                            {n.profit.toLocaleString("en-US", {
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

export default withStyles(styles)(withApollo(Clubs));
