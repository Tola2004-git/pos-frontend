import Layout from "../components/layout/Layout";
import { glassCard } from "../utils/styles";

function Dashboard() {
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="p-6 rounded-2xl text-center" style={glassCard}>
          <p className="text-white/70 text-sm">Total Sales</p>
          <p className="text-3xl font-bold text-white mt-2">$0</p>
        </div>

        <div className="p-6 rounded-2xl text-center" style={glassCard}>
          <p className="text-white/70 text-sm">Total Orders</p>
          <p className="text-3xl font-bold text-white mt-2">0</p>
        </div>

        <div className="p-6 rounded-2xl text-center" style={glassCard}>
          <p className="text-white/70 text-sm">Total Products</p>
          <p className="text-3xl font-bold text-white mt-2">0</p>
        </div>

      </div>
    </Layout>
  )
}

export default Dashboard