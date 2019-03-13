import _ from 'lodash';
import { saveAs } from 'file-saver';
import Form from '../../forms/common/form';

class CyExport extends Form {
  config = {
    buttonLabel: 'Export',
  }

  constructor(props) {
    super(props);
    this.defaultName = this.defaultName || props.defaultName;
    this.cyPath = props.cyPath;
    this.store = props.store;
  }

  get cy()  {
    return _.get(this.store.getState(), this.cyPath);
  }

  async export() {
    return 'No export implemented!';
  }

  async submit() {
    const exportedData = await this.export();
    saveAs(exportedData, this.defaultName);
  }
}

export default CyExport;
