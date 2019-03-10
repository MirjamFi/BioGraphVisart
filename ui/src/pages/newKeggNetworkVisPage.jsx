import React from 'react';
import Grid from '../utils/grid';
import NewKeggNetworkVisForm from '../forms/newKeggNetworkVisForm';

class NewKeggNetworkVisPage extends Grid {
  columns = '1fr 3fr 1fr';
  rows = '1fr 2fr 1fr';
  components = [
    null, null, null,
    null, <NewKeggNetworkVisForm history={this.props.history}/>, null,
    null, null, null,
  ];
};

export default NewKeggNetworkVisPage;
