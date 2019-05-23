import React from 'react'

import TextField from '@material-ui/core/TextField'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import withStyles from '@material-ui/core/styles/withStyles'
import SettingsIcon from '@material-ui/icons/Settings'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import Select from '@material-ui/core/Select'
import Input from '@material-ui/core/Input'
import MenuItem from '@material-ui/core/MenuItem'
import Badge from '@material-ui/core/Badge'
import Popover from '@material-ui/core/Popover'

import { toolbarStyles } from '../style'

class EnhancedTableToolbar extends React.Component {
  constructor(props) {
    super(props)

    const filtersSelected = {}

    !!props.filtersBar &&
      props.filtersBar
        .filter(c => c.defaultValue)
        .forEach(item => {
          filtersSelected[item.property] = item.defaultValue
        })

    this.state = {
      anchorEl: null,
      filtersSelected: filtersSelected,
    }

    props.onFilter && Object.keys(filtersSelected).length > 0 && props.onFilter(filtersSelected)
  }

  handleClickFilters = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = () => {
    this.setState({ anchorEl: null })
  }

  handleChange = target => ({ target: { value } }) => {
    const { onFilter } = this.props
    const { filtersSelected: filtersSelectedInstate } = this.state

    const filtersSelected = { ...filtersSelectedInstate }

    filtersSelected[target] = [
      ...value.map(item => {
        return !!item.value || item.value === false ? item.value : item
      }),
    ]
    this.setState({ filtersSelected })

    if (onFilter) onFilter(filtersSelected)
  }

  resetFilters = () => {
    const { onFilter } = this.props

    this.setState({ filtersSelected: {} })

    if (onFilter) onFilter({})

    this.handleClose()
  }

  randomId = () =>
    '_' +
    Math.random()
      .toString(36)
      .substr(2, 9)

  render() {
    const {
      filters,
      filtersBar,
      numSelected,
      classes,
      title,
      handleRequestFilter,
      columnsCanSearch,
      numberFiltersActive,
      columns,
    } = this.props
    const { anchorEl, filtersSelected } = this.state
    return (
      <Toolbar className={classes.root}>
        <div className={classes.title}>
          {numSelected > 0 ? (
            <Typography color="inherit" variant="subheading">
              {numSelected} selected
            </Typography>
          ) : typeof title === 'string' ? (
            <Typography variant="title">{title}</Typography>
          ) : (
            title
          )}
        </div>

        <div className={classes.filtersContainer}>
          {!!filtersBar && filtersBar.length > 0 && (
            <div className={classes.barContainer}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {filtersBar.map(filter => {
                  return (
                    <React.Fragment key={filter.property}>
                      <div>
                        {filter.name}
                        <Select
                          multiple
                          value={filtersSelected[filter.property] || []}
                          onChange={this.handleChange(filter.property)}
                          input={<Input id="select-multiple" />}
                          fullWidth
                        >
                          {filter.values.map(item => (
                            <MenuItem
                              key={!!item.value ? item.value : item || this.randomId()}
                              value={!!item.value ? item.value : item}
                            >
                              {!!item.label ? item.label : item}
                            </MenuItem>
                          ))}
                        </Select>
                      </div>
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          )}

          {columnsCanSearch.length > 0 && (
            <TextField
              id="search"
              label="Search field"
              type="search"
              placeholder={`Search on ${columnsCanSearch
                .map(c => columns.find(c2 => c2.property === c).name)
                .join(', ')}`}
              onChange={handleRequestFilter}
              className={classes.searchBar}
            />
          )}

          {Object.keys(filters).length > 0 && (
            <>
              <Tooltip title="Choose filters">
                <Badge
                  color="primary"
                  badgeContent={numberFiltersActive}
                  style={{ position: 'relative', top: -10, left: -10 }}
                >
                  <IconButton onClick={this.handleClickFilters}>
                    <SettingsIcon />
                  </IconButton>
                </Badge>
              </Tooltip>
              <Popover
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={this.handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <div className={classes.popContainer}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <b>Filters...</b>
                    </div>

                    <Button color="secondary" onClick={this.resetFilters} variant="text">
                      reset
                    </Button>
                  </div>
                  <br />
                  <br />
                  {Object.keys(filters).map(filter => {
                    return (
                      <div key={filter}>
                        {columns.find(c => c.property === filter).name}
                        <Select
                          multiple
                          value={filtersSelected[filter] || []}
                          onChange={this.handleChange(filter)}
                          input={<Input id="select-multiple" />}
                          fullWidth
                        >
                          {filters[filter].map(item => (
                            <MenuItem key={item || this.randomId()} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </Select>
                      </div>
                    )
                  })}
                </div>
              </Popover>
            </>
          )}
        </div>
      </Toolbar>
    )
  }
}

export default withStyles(toolbarStyles)(EnhancedTableToolbar)
