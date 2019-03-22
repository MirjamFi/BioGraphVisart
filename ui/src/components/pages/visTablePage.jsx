import React from 'react';
import TablePage from './common/tablePage';
import VisTable from '../utils/tables/visTable';

class VisPage extends TablePage {
  components = [
    null, null, null,
    null, <VisTable history={this.props.history}/>, null,
    null, null, null,
  ];
}

export default VisPage;
