"use client"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@layouts/components/ui/table"
import { Input } from "@layouts/components/ui/input"
import { Label } from "@layouts/components/ui/label"
import { useEffect, useState } from "react"

type VWData = {
  vw: number;
  px: number;
}

export const TableVw = () => {
  const [result, setResult] = useState<VWData[]>([])
  const [maxWidth, setMaxWidth] = useState<number>(1200)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/get-vw/${maxWidth}`);
        const data = await res.json();
        setResult(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData()
  }, [maxWidth]);

  return (
    <>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="max-width">Max width</Label>
        <Input
          type="number"
          placeholder="Max width"
          onBlur={(e) => setMaxWidth(Number(e.target.value))}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>VW</TableHead>
            <TableHead>PX</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.map((item) => (
            <TableRow key={item.vw}>
              <TableCell className="font-medium">{item.vw}vw</TableCell>
              <TableCell>{item.px}px</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}