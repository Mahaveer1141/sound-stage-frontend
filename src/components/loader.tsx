import { Spinner } from "./ui/spinner";

export default function Loader() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <Spinner className="size-10" />
    </div>
  );
}
