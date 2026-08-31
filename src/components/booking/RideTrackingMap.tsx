import { mapEmbedUrl } from "@/lib/ride-booking";
import { cn } from "@/lib/utils";

interface RideTrackingMapProps {
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropoffLat?: number | null;
  dropoffLng?: number | null;
  driverLat?: number | null;
  driverLng?: number | null;
  vehicleImage?: string;
  vehicleName?: string;
  className?: string;
}

export function RideTrackingMap(props: RideTrackingMapProps) {
  const originLat = props.driverLat ?? props.pickupLat;
  const originLng = props.driverLng ?? props.pickupLng;
  const src = mapEmbedUrl(
    originLat,
    originLng,
    props.dropoffLat,
    props.dropoffLng,
  );

  return (
    <div
      className={cn(
        "relative h-[42dvh] min-h-[220px] w-full overflow-hidden bg-[#283614]",
        "sm:h-[48dvh] lg:h-full lg:min-h-dvh",
        props.className,
      )}
    >
      <iframe
        key={src}
        src={src}
        title={props.vehicleName ? `${props.vehicleName} live map` : "Live ride map"}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen={false}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#283614]/35 to-transparent lg:hidden"
      />
    </div>
  );
}
