import { getRooms } from '@/lib/data';
import { RoomsTable } from '@/components/rooms/rooms-table';

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <RoomsTable rooms={rooms} />
    </div>
  );
}