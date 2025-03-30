/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  flexRender,
  ColumnDef
} from '@tanstack/react-table';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';

import './DataTable.css';

type GenericRow = Record<string, any>;

interface DataTableProps {
  data: GenericRow[];
  rowHeight?: number;
  tableHeight?: number;
}

function DataTable({
  data,
  rowHeight = 40,
  tableHeight = 600
}: DataTableProps) {
  // If no data
  if (!data || data.length === 0) {
    return <div className="no-data">No data available</div>;
  }

  // Build columns from the first row
  const columnHelper = createColumnHelper<GenericRow>();
  const columns = useMemo<ColumnDef<GenericRow>[]>(() => {
    const firstRowKeys = Object.keys(data[0]);
    return firstRowKeys.map((key) =>
      columnHelper.accessor(key, {
        header: () => key,
        cell: (info) => {
          const value = info.getValue();
          if (typeof value === 'object') {
            return (
              <pre className="json-cell">
                {JSON.stringify(value, null, 2)}
              </pre>
            );
          }
          return String(value);
        },
      })
    );
  }, [data, columnHelper]);

  // Create the react-table instance
  const table = useReactTable<GenericRow>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // We'll have a separate container for the header
  const headerGroups = table.getHeaderGroups();
  const allRows = table.getRowModel().rows;

  // Count columns
  const colCount = columns.length;

  // Virtual row renderer
  const RowRenderer = ({ index, style }: ListChildComponentProps) => {
    const row = allRows[index];
    const isEven = index % 2 === 0;

    return (
      <div
        className={`grid-row ${isEven ? 'even-row' : 'odd-row'}`}
        style={{
          ...style,
          gridTemplateColumns: `repeat(${colCount}, 1fr)`
        }}
      >
        {row.getVisibleCells().map((cell) => (
          <div key={cell.id} className="grid-cell">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        ))}
      </div>
    );
  };

  // We measure the scrollbar width to add a right-padding on the header
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      const scroller = scrollRef.current;
      // Create a temporary invisible scrollbar to measure
      const scrollBarTest = document.createElement('div');
      scrollBarTest.style.width = '100px';
      scrollBarTest.style.height = '100px';
      scrollBarTest.style.overflowY = 'scroll';
      scrollBarTest.style.position = 'absolute';
      scrollBarTest.style.top = '-9999px';
      scroller.appendChild(scrollBarTest);
      setScrollbarWidth(scrollBarTest.offsetWidth - scrollBarTest.clientWidth);
      scroller.removeChild(scrollBarTest);
    }
  }, []);

  return (
    <div className="rt-container">
      {/* Header container */}
      <div className="header-row">
        {headerGroups.map((headerGroup) => (
          <div
            key={headerGroup.id}
            className="grid-row header-row-inner"
            style={{
              gridTemplateColumns: `repeat(${colCount}, 1fr)`,
              /* We add right padding equal to scrollbar width 
                 so the columns line up with the body scrollbar. */
              paddingRight: `${scrollbarWidth}px`
            }}
          >
            {headerGroup.headers.map((header) => (
              <div key={header.id} className="grid-cell header-cell">
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Virtualized rows */}
      <div
        className="rows-container"
        style={{ height: tableHeight }}
        ref={scrollRef}
      >
        <List
          height={tableHeight}
          itemCount={allRows.length}
          itemSize={rowHeight}
          width="100%"
        >
          {RowRenderer}
        </List>
      </div>
    </div>
  );
}

export default DataTable;
