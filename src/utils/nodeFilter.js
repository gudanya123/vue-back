const nodeFilter = {
  isNodeExisted (type, data) {
    if (type && data) {
      return data.some(item => {
        return item.type === type;
      });
    }
  },
  getNodeTypeById (id, data) {
    let nodeIndex;

    data.some((item, index) => {
      if (item.id === id) {
        nodeIndex = index;
        return true;
      }
    });
    return data[nodeIndex].type;
  },
  getNewValidId (id, prefix) {
    prefix = prefix || '^node|^line';
    const reg = new RegExp(prefix);

    if (!reg.test(id)) {
      return `${prefix}${id}`;
    }
    return id;
  },
  convertInvalidIdData (key, primaryData) {
    const keysOfIdRelated = ['id', 'incoming', 'outgoing', 'source', 'target', 'conditions'];
    let newData = {};

    switch (key) {
      case 'activities':
      case 'flows':
      case 'gateways':
        for (const key in primaryData) {
          const newKey = this.getNewValidId(key);

          newData[newKey] = primaryData[key];
          keysOfIdRelated.forEach(item => {
            const val = newData[newKey][item];

            if (val !== undefined && val !== '') {
              if (typeof val === 'string') {
                newData[newKey][item] = this.getNewValidId(val);
              } else if (Array.isArray(val)) {
                newData[newKey][item] = val.map(v => {
                  return this.getNewValidId(v);
                });
              }
              if (item === 'conditions') {
                const newVal = {};

                for (const conditionId in val) {
                  const newConditionId = this.getNewValidId(conditionId);

                  newVal[newConditionId] = val[conditionId];
                  newVal[newConditionId].tag = newVal[newConditionId].tag.split('_').map((id, index) => {
                    return index > 0 ? this.getNewValidId(id) : id;
                  }).join('_');
                }
                newData[newKey][item] = newVal;
              }
            }
          });
        }
        return newData;
      case 'end_event':
      case 'start_event':
        newData = Object.assign({}, primaryData);
        keysOfIdRelated.forEach(item => {
          const val = newData[item];

          if (val !== undefined && val !== '') {
            newData[item] = this.getNewValidId(val);
          }
        });
        return newData;
      case 'line':
        newData = [...primaryData];
        newData.forEach((item, index) => {
          item.id = this.getNewValidId(item.id);
          item.source.id = this.getNewValidId(item.source.id);
          item.target.id = this.getNewValidId(item.target.id);
        });
        return newData;
      case 'location':
        newData = [...primaryData];
        newData.forEach((item) => {
          item.id = this.getNewValidId(item.id);
        });
        return newData;
      default:
        return primaryData;
    }
  }
};

export default nodeFilter;
