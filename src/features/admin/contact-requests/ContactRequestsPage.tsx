import { useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { getAllContactRequests, ContactRequest } from '@/api/services/contactRequestService';
import { useToast } from '@/hooks/use-toast';

export const ContactRequestsPage: React.FC = () => {
  const { toast } = useToast();

  const { data, loading, error, execute } = useApi(getAllContactRequests);

  useEffect(() => {
    execute();
  }, [execute]);

  useEffect(() => {
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }, [error, toast]);

  const requests: ContactRequest[] = data?.requests || [];

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Contact Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.name}</TableCell>
                    <TableCell>{req.email}</TableCell>
                    <TableCell>{req.phone}</TableCell>
                    <TableCell>{req.subject}</TableCell>
                    <TableCell className="max-w-xs truncate" title={req.message}>{req.message}</TableCell>
                    <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 