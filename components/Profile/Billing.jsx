import Payments from "./Payment";

export default function Billing() {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Billing Information</h1>
        <p>Your billing information will be displayed here.</p>
        <Payments/>
      </div>
    );
  }