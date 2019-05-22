const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
    minHeight: '8rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    flex: '0 0 auto'
  },
  searchBar: {
    minWidth: '30rem'
  },
  filtersContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  popContainer: {
    padding: 16,
    minWidth: 200
  },

  barContainer: {
    padding: 16,
    minWidth: 200
  }
})

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3
  },
  table: {
    minWidth: 1020
  },
  tableWrapper: {
    overflowX: 'auto'
  }
})

export { toolbarStyles, styles }
