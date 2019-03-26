import React, { Component } from 'react';
import ReactTable from 'react-table';

import routes from '../../../routes';
import * as api from '../../../services/api/vis';

class VisTable extends Component {
  columns = [
    { 
      Header: 'Id',
      accessor: 'id',
      Cell: row => <div style={{ textAlign: 'center' }}>{row.value}</div>,
    },
    {
      Cell: ({ row }) => (
        <React.Fragment>
          <button
            className="btn btn-primary"
            onClick={() => {
              this.props.history.push(`${routes.viewer}/${row.id}`);
            }}
          >
            View
          </button>
          <button className="btn btn-danger m-2">
            <i className="fa fa-trash-o"></i>
          </button>
        </React.Fragment>
      ),
      maxWidth: 200,
    },
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
