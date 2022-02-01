"use strict";

(() => {
  function parseFilterExpression(expr) {
    let negate = false;
    let term = expr;

    if (term.charAt(0) === "-") {
      // Allow negating filters with -Query
      negate = true;
      term = term.substr(1);
    } else if (term.charAt(0) === "\\") {
      // Allow the escaping of negated filters with \-Query
      term = term.substr(1);
    }
    return {
      term: term,
      negate: negate,
    };
  }

  // do the cells in `row` match against the given `filters`?
  function isMatchingRow(row, filters) {
    let cells = row.children;
    let rowMatches = true;
    for (let c = 0; c < Math.min(filters.length, cells.length); c++) {
      let cell = cells[c];
      let filter = filters[c];
      let cellContent = cell.innerText;
      let cellMatches =
        cellContent.includes(filter.term) ||
        cellContent.toUpperCase().includes(filter.term.toUpperCase());
      if (filter.negate) {
        cellMatches = !cellMatches;
      }
      rowMatches &= cellMatches;
    }
    return rowMatches;
  }

  // get the string contents of the filter input fields
  function getFilterValues(filterRow) {
    let filterInputs = filterRow.getElementsByTagName("input");

    let filterValues = [];
    for (let input of filterInputs) {
      filterValues.push(input.value);
    }
    return filterValues;
  }

  // only show rows that match the input boxes
  function filterTable(table, filterRow) {
    let filterValues = getFilterValues(filterRow);
    let filters = filterValues.map(parseFilterExpression);

    let tbody = table.getElementsByTagName("tbody")[0];
    let rows = tbody.getElementsByTagName("tr");
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];
      if (isMatchingRow(row, filters)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    }
  }

  // get first child element by tag name, or create it if it doesn't exist
  function getOrCreate(parentElement, tagName) {
    let childElement = parentElement.getElementsByTagName(tagName)[0];
    if (childElement === undefined) {
      childElement = document.createElement(tagName);
      parentElement.insertBefore(childElement, parentElement.firstChild);
    }
    return childElement;
  }

  function decorateTable(table) {
    //get all rows of this table
    let rows = table.getElementsByTagName("tr");
    //get the first row
    let firstRow = rows[0];
    //get the first rows <td> elements
    let firstCells = firstRow.children;
    // create an a new table row <tr> element, this will be our new input element for filter values
    let filterRow = document.createElement("tr");
    // for each cell of the first row, do the following.
    for (let i = 0; i < firstCells.length; i++) {
      // add a table data or single cell element.
      let filterCell = document.createElement("td");
      // for each td cell, create a input
      let filterInput = document.createElement("input");
      // give the inpu the type of "search"
      filterInput.type = "search";
      //set the width of the input
      filterInput.style.width =
        firstCells[i].getBoundingClientRect()["width"] - 10 + "px";
      // attach an event listener to the "input" that calls the filterTable whenever you input
      filterInput.addEventListener("input", function () {
        filterTable(table, filterRow);
      });
      // add the above constructed <input> element to the <td> we created above
      filterCell.appendChild(filterInput);
      // add the created <td> to the filterRow we created above.
      filterRow.appendChild(filterCell);
    }
    // create a <thead> if it doesn't have one.
    let thead = getOrCreate(table, "thead");
    thead.appendChild(filterRow);
  }
  //get all top level tables from a webpage, and call the decorate table function on each them
  let tables = document.getElementsByTagName("table");
  for (var table of tables) {
    decorateTable(table);
  }
})();
