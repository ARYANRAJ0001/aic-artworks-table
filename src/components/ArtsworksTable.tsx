
import { useEffect, useRef, useState } from "react";
import type { Artwork } from "../types/art";
import { fetchArtworks } from "../api/artworks";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { OverlayPanel } from "primereact/overlaypanel";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";

type Mode = "manual" | "all_upto_n";


const toId = (row: Artwork): number => {
  const n = Number(row.id);
  if (!Number.isFinite(n)) throw new Error(`Artwork id is not numeric: ${String(row.id)}`);
  return n;
};

const ArtworksTable = () => {
  
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [rows, setRows] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

 
  const [currentSelection, setCurrentSelection] = useState<Artwork[]>([]);

  
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deselectedIds, setDeselectedIds] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<Mode>("manual");
  const [targetCount, setTargetCount] = useState(0);

  
  const overlayRef = useRef<OverlayPanel>(null);
  const [nValue, setNValue] = useState<number | null>(25);

  
  const isRowSelected = (row: Artwork, globalIndex: number) => {
    const id = toId(row);
    const manual = selectedIds.has(id);
    const rule = mode === "all_upto_n" && globalIndex < targetCount;
    const deselected = deselectedIds.has(id);
    return (manual || rule) && !deselected;
  };

  
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetchArtworks(page, rowsPerPage)
      .then(({ rows, totalRecords }) => {
        if (cancelled) return;
        setRows(rows);
        setTotalRecords(totalRecords);
      })
      .catch(console.error)
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, rowsPerPage]);

  
  useEffect(() => {
    const firstIndex = (page - 1) * rowsPerPage;
    const nextSelection = rows.filter((row, i) => isRowSelected(row, firstIndex + i));
    setCurrentSelection(nextSelection);
   
  }, [rows, page, rowsPerPage, selectedIds, deselectedIds, mode, targetCount]);

  return (
    <div>
      <h2>Artworks</h2>

     
      <div style={{ marginBottom: "0.75rem", display: "flex", gap: "0.5rem" }}>
        <Button
          label="Custom Select"
          type="button"
          onClick={(e) => overlayRef.current?.toggle(e)}
        />

        <Button
          label="Clear"
          type="button"
          onClick={() => {
           
            setMode("manual");
            setTargetCount(0);
            setSelectedIds(new Set());
            setDeselectedIds(new Set());
            setCurrentSelection([]);
          }}
        />

        <OverlayPanel ref={overlayRef}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: 220 }}>
            <div>
              <div style={{ marginBottom: 6 }}>Enter N</div>
              <InputNumber
                value={nValue}
                onValueChange={(e) => setNValue(e.value ?? null)}
                min={0}
                max={totalRecords || undefined}
                useGrouping={false}
                placeholder="e.g. 25"
              />
            </div>

            <Button
              label="Apply"
              type="button"
              onClick={() => {
                const N = Math.max(0, Number(nValue ?? 0));
               
                setMode("all_upto_n");
                setTargetCount(N);
                overlayRef.current?.hide();
              }}
            />
          </div>
        </OverlayPanel>
      </div>

      <DataTable
        value={rows}
        dataKey="id"
        paginator
        lazy
        loading={loading}
        totalRecords={totalRecords}
        rows={rowsPerPage}
        first={(page - 1) * rowsPerPage}
        rowsPerPageOptions={[6, 12, 24, 48]}
        onPage={(e) => {
          const newRows = e.rows ?? rowsPerPage;
          const newPage = (e.page ?? 0) + 1;

          if (newRows !== rowsPerPage) {
            setRowsPerPage(newRows);
            setPage(1);
          } else if (newPage !== page) {
            setPage(newPage);
          }
        }}
        selectionMode="multiple"
        selection={currentSelection}
        onSelectionChange={(e) => {
          
          const nextRows = (e.value ?? []) as Artwork[];

          const nextIds = new Set<number>(nextRows.map(toId));
          const prevIds = new Set<number>(currentSelection.map(toId));

          const added: number[] = [];
          const removed: number[] = [];

          nextIds.forEach((id) => {
            if (!prevIds.has(id)) added.push(id);
          });
          prevIds.forEach((id) => {
            if (!nextIds.has(id)) removed.push(id);
          });

          setSelectedIds((prev) => {
            const s = new Set(prev);
            for (const id of added) s.add(id);
            for (const id of removed) s.delete(id);
            return s;
          });

          setDeselectedIds((prev) => {
            const d = new Set(prev);
            for (const id of added) d.delete(id);
            if (mode === "all_upto_n") {
              for (const id of removed) d.add(id);
            }
            return d;
          });

          setCurrentSelection(nextRows);

          
          if (mode === "manual") setMode("manual");
        }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="id" header="ID" />
        <Column field="title" header="Title" />
        <Column field="image_url" header="Image URL" />
      </DataTable>
    </div>
  );
};

export default ArtworksTable;
