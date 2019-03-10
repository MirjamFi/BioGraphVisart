import React from 'react';
import Grid from '../utils/grid';
import KeggNetworkVis from '../vis/keggNetworkVis';

class keggNetworkVisPage extends Grid {
  columns = '1fr 4fr';
  components = [null, null];

  constructor(props) {
    super(props);
    const searchParams = new URLSearchParams(this.props.location.search);
    const graphmlStr = decodeURI(searchParams.get('graphml'));
    this.components = [null, <KeggNetworkVis graphmlSeed={graphmlStr}/>]
  }
};

export default keggNetworkVisPage;
