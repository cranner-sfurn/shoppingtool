import StorePicker from "@/components/store-picker";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Shopping Tool</h1>
      </div>
      <StorePicker />
    </div>
  );
}
