import React, { Component } from 'react'
import ReactDOMServer from 'react-dom/server'
import PropTypes from 'prop-types'
import moment from 'moment'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import { withStyles } from '@material-ui/core/styles'
import IconCheck from '@material-ui/icons/Check'
import IconClose from '@material-ui/icons/Close'
import Paper from '@material-ui/core/Paper'
import TableFooter from '@material-ui/core/TableFooter'

import { styles } from './style'
import EnhancedTableToolbar from './EnhancedTableToolbar'
import EnhancedTableHead from './EnhancedTableHead'

const prepareData = data => {
  if (typeof data === 'number') return data.toString()
  if (React.isValidElement(data)) {
    const regex = /data-value="(.+?)"/

    const html = ReactDOMServer.renderToString(data)

    const found = regex.exec(html)

    if (found) return found[1]
    else return ''
  }
  if (data.toISOString) return data.toISOString()

  return data
}

const hydrate = nextProps => {
  const columnsFiltered = nextProps.columns.filter(
    thisColumn => thisColumn.canSearch
  )

  return columnsFiltered.map(thisColumn => thisColumn.property)
}

const handleRequestFilter = ({ event, state, props, columnsCanSearch }) => {
  const { searchRequest } = state
  const { entries } = props
  const property = event ? event.target.value.trim() : searchRequest
  const properties = property.split(' ')

  const data = !property
    ? entries
    : entries.filter(thisEntry => {
        // on éclate les mots clef par l'espace
        const results = properties.map(propertySplitted => {
          // on cherche si une colonne match avec un des mots clefs
          const results = Object.keys(thisEntry).map(thisColumn => {
            if (
              !thisEntry[thisColumn] ||
              !columnsCanSearch.includes(thisColumn)
            )
              return false

            const value = prepareData(thisEntry[thisColumn])

            const regex = new RegExp(`(.+)?${propertySplitted}(.+)?`, 'i')

            return regex.test(value)
          })

          return results.includes(true)
        })

        return properties.length === results.filter(result => result).length
      })

  return {
    ...state,
    searchRequest: property,
    data: sortTable({
      entries: data,
      order: state.order,
      orderBy: state.orderBy
    })
  }
}

const sortTable = ({ entries, order, orderBy }) => {
  return order === 'desc'
    ? entries.sort((a, b) =>
        moment(b[orderBy]).isValid()
          ? moment(b[orderBy]).isBefore(a[orderBy])
            ? -1
            : 1
          : prepareData(b[orderBy]).localeCompare(
              prepareData(a[orderBy]),
              undefined,
              { numeric: true, sensitivity: 'base' }
            )
      )
    : entries.sort((a, b) =>
        moment(a[orderBy]).isValid()
          ? moment(a[orderBy]).isBefore(b[orderBy])
            ? -1
            : 1
          : prepareData(a[orderBy]).localeCompare(
              prepareData(b[orderBy]),
              undefined,
              { numeric: true, sensitivity: 'base' }
            )
      )
}

const CustomTableCell = withStyles(theme => ({
  footer: {
    backgroundColor: '#635d65',
    color: theme.palette.common.white
  },
  body: {
    fontSize: 14
  }
}))(TableCell)

class EnhancedTable extends Component {
  constructor(props) {
    super(props)

    let orderBy = 0
    if (props.columns.find(c => c.defaultSort)) {
      orderBy = props.columns.find(c => c.defaultSort).property
    }

    const order = 'desc'

    this.state = {
      order,
      orderBy,
      searchRequest: '',
      filtersApply: {},
      data: sortTable({
        orderBy,
        entries: props.entries,
        order
      })
    }

    this.state.data = sortTable({
      orderBy,
      entries: props.entries,
      order: this.state.order
    })

    this.columnsCanSearch = hydrate(props)
  }

  columnsCanSearch = []

  static getDerivedStateFromProps(props, state) {
    const columnsCanSearch = hydrate(props)

    return handleRequestFilter({
      props,
      state,
      columnsCanSearch
    })
  }

  getCellContent = (col, entry) => {
    const { formatDisplay } = this.props

    if (
      entry[col.property] &&
      entry[col.property].toISOString &&
      moment(entry[col.property].toISOString()).isValid()
    ) {
      return moment(entry[col.property].toISOString()).format(
        col.format || 'DD/MM/YYYY'
      )
    } else if (typeof entry[col.property] === 'boolean') {
      return entry[col.property] ? <IconCheck /> : <IconClose />
    } else if (typeof col === 'string') {
      return entry[col]
    } else if (typeof col.property === 'string' && !col.as) {
      return formatDisplay
        ? formatDisplay(entry[col.property])
        : entry[col.property]
    } else {
      return (
        <col.as property={col.property} {...entry} {...col.additionalProps} />
      )
    }
  }

  handleRequestSort = (event, orderBy) => {
    const { data: entries, order } = this.state

    this.setState({
      data: sortTable({ entries, orderBy, order }),
      order:
        this.state.orderBy === orderBy && this.state.order === 'desc'
          ? 'asc'
          : 'desc',
      orderBy
    })
  }

  getDynamicFilters = () => {
    const { columns } = this.props
    const { data } = this.state

    const filters = columns.filter(c => c.canFilter)
    let filtersValues = {}
    if (filters.length > 0) {
      filters.forEach(filter => {
        const values = data.map(entry => this.getCellContent(filter, entry))
        filtersValues[filter.property] = [...new Set(values)]
      })
    }

    return filtersValues
  }

  handleFilter = filtersApply => {
    this.setState({ filtersApply })
  }

  applyFilters = data => {
    const { filtersApply } = this.state

    let pass = true
    Object.keys(filtersApply).forEach(filter => {
      if (filtersApply[filter] && filtersApply[filter].length === 0) return
      if (!filtersApply[filter].includes(data[filter])) pass = false
    })

    return pass
  }

  countFiltersActive = () => {
    const { filtersApply } = this.state

    let number = 0

    Object.values(filtersApply).forEach(filter => {
      if (filter.length > 0) number += 1
    })

    return number
  }

  randomId = () =>
    '_' +
    Math.random()
      .toString(36)
      .substr(2, 9)

  render() {
    const {
      classes,
      title,
      columns,
      keyTableRow,
      filtersBar,
      onLoadingDataFromFilter
    } = this.props
    const { order, orderBy, data } = this.state

    const filtersValues = this.getDynamicFilters()

    const numberFiltersActive = this.countFiltersActive()
    const footerDynamic = {}
    return (
      <>
        <Paper className={classes.root}>
          {title && (
            <EnhancedTableToolbar
              filters={filtersValues}
              filtersBar={filtersBar}
              numberFiltersActive={numberFiltersActive}
              columns={columns}
              title={title}
              columnsCanSearch={this.columnsCanSearch}
              handleRequestFilter={event => {
                const newState = handleRequestFilter({
                  event,
                  props: this.props,
                  state: this.state,
                  columnsCanSearch: this.columnsCanSearch
                })
                this.setState(newState)
              }}
              onFilter={this.handleFilter}
            />
          )}

          <div className={classes.tableWrapper}>
            <Table>
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                columns={columns.filter(c => c.canHide !== true)}
                onRequestSort={this.handleRequestSort}
              />

              <TableBody>
                {((onLoadingDataFromFilter && numberFiltersActive > 0) ||
                  !onLoadingDataFromFilter) &&
                  data.filter(this.applyFilters).map(entry => (
                    <TableRow
                      key={`${entry._id || this.randomId()}${keyTableRow}`}
                    >
                      {columns
                        .filter(c => c.canHide !== true)
                        .map((col, index) => {
                          const value = this.getCellContent(col, entry)
                          if (
                            col.canTotal === true &&
                            (typeof value === 'number' ||
                              typeof parseFloat(value) === 'number')
                          ) {
                            !!footerDynamic[col.property]
                              ? (footerDynamic[col.property] =
                                  footerDynamic[col.property] + parseInt(value))
                              : (footerDynamic[col.property] = parseInt(value))
                          }

                          return (
                            <TableCell
                              key={index}
                              style={{ textAlign: col.align || 'left' }}
                            >
                              {value}
                            </TableCell>
                          )
                        })}
                    </TableRow>
                  ))}
              </TableBody>
              {Object.keys(footerDynamic).length > 0 &&
                ((onLoadingDataFromFilter && numberFiltersActive > 0) ||
                  !onLoadingDataFromFilter) && (
                  <TableFooter>
                    <TableRow key={`Total${this.randomId()}${keyTableRow}`}>
                      {columns
                        .filter(c => c.canHide !== true)
                        .map((col, index) => {
                          const value = this.getCellContent(col, footerDynamic)

                          return (
                            <CustomTableCell key={index}>
                              {!!value ? value : index === 0 ? 'Total' : ''}
                            </CustomTableCell>
                          )
                        })}
                    </TableRow>
                  </TableFooter>
                )}
            </Table>
          </div>
        </Paper>
      </>
    )
  }
}

export default withStyles(styles)(EnhancedTable)

EnhancedTable.propTypes = {
  entries: PropTypes.array.isRequired,
  onLoadingDataFromFilter: PropTypes.bool,
  filtersBar: PropTypes.array,
  keyTableRow: PropTypes.string,
  columns: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        property: PropTypes.string,
        name: PropTypes.string,
        as: PropTypes.func, // React Component Proto
        align: PropTypes.string,
        canFilterBar: PropTypes.boolean,
        canFilter: PropTypes.boolean,
        canHide: PropTypes.boolean,
        canSort: PropTypes.boolean,
        canSearch: PropTypes.boolean,
        canTotal: PropTypes.boolean
      }),
      PropTypes.shape({
        name: PropTypes.string,
        property: PropTypes.string
      })
    ])
  ).isRequired
}
