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
    minWidth: 300
  }
});

class TopTransfers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      order: "desc",
      orderBy: "value",
      page: 0,
      rowsPerPage: 10,
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

    this.setState({ order, orderBy });
  };

  getFromClubFilter = () => {
    return { from_club: { name_contains: this.state.fromClubFilter } };
  };

  getToClubFilter = () => {
    return { to_club: { name_contains: this.state.toClubFilter } };
  };

  handleFilterChange = filterName => event => {
    const val = event.target.value;

    this.setState({
      [filterName]: val
    });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { order, orderBy } = this.state;
    const { classes } = this.props;

    return (
      <Paper className={classes.root}>
        <Typography variant="h2" style={{ padding: "7px" }} gutterBottom>
          Top Transfers
        </Typography>
        <TextField
          id="fromClub"
          label="From Club"
          className={classes.textField}
          value={this.state.fromClubFilter}
          onChange={this.handleFilterChange("fromClubFilter")}
          margin="normal"
          variant="outlined"
          type="text"
          InputProps={{
            className: classes.input
          }}
        />

        <TextField
          id="toClub"
          label="To Club"
          className={classes.textField}
          value={this.state.toClubFilter}
          onChange={this.handleFilterChange("toClubFilter")}
          margin="normal"
          variant="outlined"
          type="text"
          InputProps={{
            className: classes.input
          }}
        />

        <Query
          query={gql`
            query topTransfers(
              $orderBy: [_TransferOrdering]
              $first: Int
              $offset: Int
              $filter: _TransferFilter
            ) {
              Transfer(
                first: $first
                orderBy: $orderBy
                offset: $offset
                filter: $filter
              ) {
                date {
                  formatted
                }
                value
                id
                of_player {
                  name
                  image
                }
                from_club {
                  name
                  image
                }
                to_club {
                  name
                  image
                }
              }
            }
          `}
          variables={{
            first: this.state.rowsPerPage,
            offset: this.state.rowsPerPage * this.state.page,
            filter: { AND: [this.getFromClubFilter(), this.getToClubFilter()] },
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
                        key="date"
                        sortDirection={orderBy === "date" ? order : false}
                      >
                        Date
                      </TableCell>
                      <TableCell
                        key="player"
                        sortDirection={orderBy === "player" ? order : false}
                        colSpan={2}
                      >
                        Player
                      </TableCell>
                      <TableCell
                        key="club"
                        sortDirection={orderBy === "club" ? order : false}
                        colSpan={2}
                      >
                        From
                      </TableCell>
                      <TableCell
                        key="country"
                        sortDirection={orderBy === "country" ? order : false}
                        colSpan={2}
                      >
                        To
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
                            active={orderBy === "value"}
                            direction={order}
                            onClick={() => this.handleSortRequest("value")}
                          >
                            Transfer Fee
                          </TableSortLabel>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.Transfer.map(n => {
                      return (
                        <TableRow key={n.id}>
                          <TableCell component="th" scope="row">
                            {n.date.formatted}
                          </TableCell>
                          <TableCell padding={"checkbox"}>
                            {n.of_player[0].image ? (
                              <Avatar
                                style={{ width: 20, height: 20 }}
                                alt={n.of_player[0].name}
                                src={n.of_player[0].image.replace(
                                  "tiny",
                                  "medium"
                                )}
                              />
                            ) : null}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {n.of_player[0].name}
                          </TableCell>
                          <TableCell padding={"checkbox"}>
                            {n.from_club[0].image ? (
                              <Avatar
                                style={{ width: 20, height: 20 }}
                                alt={n.from_club[0].name}
                                src={n.from_club[0].image.replace(
                                  "tiny",
                                  "medium"
                                )}
                              />
                            ) : null}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {n.from_club[0].name}
                          </TableCell>
                          <TableCell padding={"checkbox"}>
                            {n.to_club[0].image ? (
                              <Avatar
                                style={{ width: 20, height: 20 }}
                                alt={n.to_club[0].name}
                                src={n.to_club[0].image.replace(
                                  "tiny",
                                  "medium"
                                )}
                              />
                            ) : null}
                          </TableCell>
                          <TableCell>{n.to_club[0].name}</TableCell>
                          <TableCell>
                            {n.value.toLocaleString("en-US", {
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
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={20}
                  rowsPerPage={this.state.rowsPerPage}
                  page={0}
                  backIconButtonProps={{
                    "aria-label": "previous page"
                  }}
                  nextIconButtonProps={{
                    "aria-label": "next page"
                  }}
                  // onChangePage={handleChangePage}
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

export default withStyles(styles)(TopTransfers);
