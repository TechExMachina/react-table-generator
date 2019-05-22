import React from 'react'

import TableCell from '@material-ui/core/TableCell'
import Tooltip from '@material-ui/core/Tooltip'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'

class EnhancedTableHead extends React.Component {
  createSortHandler = property => event =>
    this.props.onRequestSort(event, property)

  render() {
    const { order, orderBy, columns } = this.props

    return (
      <TableHead>
        <TableRow style={{ backgroundColor: '#f7f7f7' }}>
          {columns.map(column => {
            column.numeric = false

            return column.canSort && column.property !== 'actions' ? (
              <TableCell
                key={column.property}
                align={column.numeric ? 'right' : 'left'}
                padding={column.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === column.property ? order : false}
                style={{ color: '#04a6fc' }}
              >
                <Tooltip
                  title="Sort"
                  placement={column.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === column.property}
                    direction={order}
                    onClick={this.createSortHandler(column.property)}
                  >
                    {column.name}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            ) : (
              <TableCell style={{ color: '#04a6fc' }} key={column.property}>
                {column.name}
              </TableCell>
            )
          }, this)}
        </TableRow>
      </TableHead>
    )
  }
}

export default EnhancedTableHead
