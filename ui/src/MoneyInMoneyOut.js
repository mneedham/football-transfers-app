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

class MoneyInMoneyOut extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      order: "desc",
      orderBy: "moneySpent",
      page: 0,
      rowsPerPage: 10,
      countryFilter: ""
    };
  }

  handleSortRequest = property => {
    const orderBy = property;
    let order = "desc";

    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    this.setState({ order, orderBy });
  };

  handleFilterChange = filterName => event => {
    const val = event.target.value;

    this.setState({
      [filterName]: val
    });
  };

  render() {
    const { order, orderBy } = this.state;
    const { classes } = this.props;

    return (
      <Paper className={classes.root}>
        <Typography variant="h2" style={{ padding: "7px" }} gutterBottom>
          Money In, Money Out
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
          query={gql`
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
          `}
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
              <Table className={this.props.classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      key="club"
                      sortDirection={orderBy === "club" ? order : false}
                      colSpan={2}
                    >
                      Club
                    </TableCell>
                    <TableCell
                      key="country"
                      sortDirection={orderBy === "country" ? order : false}
                      colSpan={2}
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
                        <TableCell padding={"checkbox"}>
                          <Avatar
                            style={{ width: 20, height: 20 }}
                            alt={n.club}
                            src={n.clubImage.replace("tiny", "medium")}
                          />
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {n.club}
                        </TableCell>
                        <TableCell padding={"checkbox"}>
                          {n.countryImage ? (
                            <Avatar
                              style={{ width: 20, height: 20 }}
                              alt={n.country}
                              src={n.countryImage.replace("tiny", "medium")}
                            />
                          ) : null}
                        </TableCell>
                        <TableCell>{n.country}</TableCell>
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
            );
          }}
        </Query>
      </Paper>
    );
  }
}

export default withStyles(styles)(MoneyInMoneyOut);
