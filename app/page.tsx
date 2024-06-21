import { OrderBook } from "@/app/components/OrderBook";
import { WebsocketControls } from "@/app/components/WebsocketControls";

const Home = () => (
  <main className="flex min-h-screen flex-col items-center gap-8 py-10 px-24">
    <WebsocketControls />
    <OrderBook />
  </main>
);

export default Home;
