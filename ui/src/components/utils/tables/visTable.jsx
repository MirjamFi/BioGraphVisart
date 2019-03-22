import React, { Component } from 'react';
import ReactTable from 'react-table';

import route from '../../../utils/routing';
import * as api from '../../../services/api/vis';

class VisTable extends Component {
  columns = [
    { Header: 'Id', accessor: 'id' },
    { 
      Header: 'Show',
      Cell: ({ row }) => (
        <button
          className="btn btn-primary"
          onClick={() => {
            this.props.history.push(route(`/vis/${row.id}`));
          }}
        >
          View
        </button>
      ),
    },
    {
      Header: 'Delete',
      Cell: ({ row }) => (
        <button className="btn btn-danger">
          <i className="fa fa-trash-o"></i>
        </button>
      ),
    }
  ]

  state = {
    data: [],
  }

  async componentWillMount() {
    const data = await api.getVis();
    console.log(data.data);
    this.setState({ data: data.data });
  }

  render() {
    return (
      <ReactTable 
        data={this.state.data}
        columns={this.columns}
        defaultPageSize={15}
        pageSizeOptions={[5, 10, 15]}
        noDataText="You do not have any visualizations."
        rowsText="visualizations"
      />
    );
  }
}

export default VisTable;
