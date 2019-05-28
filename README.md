## Props

|         | Format   | Required | What it does ?                   |
| ------- | -------- | -------- | -------------------------------- |
| title   | `string` | YES      | The title of the table           |
| columns | `array`  | YES      | An array to initialize the table |
| entries | `array`  | NO       | An array to fill the table |

# Columns 

Each colums can have this props

| | Format | Required | Default value | What it does ? |
| ------ | ------| ------ | ------ | ------ |
| canSort | `boolean` | NO | false | Activate sort on this column
| defaultSort | `string` one of : ['asc',  'desc'] | NO |  | If column can be sorted,this boolean indicate the table will be initialy sorted by this column
| canFilter | `boolean` | NO | false | Activate auto-filters on displayed entries |
| canSearch | `boolean` | NO | false | Activate the text search field for this column | 
| canHide | `boolean` | NO | false | Hide the column in the table, usefull to activate filter without display the field
| canTotal | ?

## Example

```javascript
```
