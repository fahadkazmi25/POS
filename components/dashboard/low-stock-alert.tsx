import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function LowStockAlert() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Current Stock</TableHead>
          <TableHead>Reorder Level</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Premium Oil Filter</TableCell>
          <TableCell>3</TableCell>
          <TableCell>10</TableCell>
          <TableCell>
            <Badge variant="destructive">Critical</Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Brake Pads (Front)</TableCell>
          <TableCell>5</TableCell>
          <TableCell>15</TableCell>
          <TableCell>
            <Badge variant="destructive">Critical</Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Windshield Wipers</TableCell>
          <TableCell>8</TableCell>
          <TableCell>20</TableCell>
          <TableCell>
            <Badge variant="warning">Low</Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Air Filter</TableCell>
          <TableCell>12</TableCell>
          <TableCell>25</TableCell>
          <TableCell>
            <Badge variant="warning">Low</Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
