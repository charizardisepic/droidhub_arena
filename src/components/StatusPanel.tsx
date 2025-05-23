
import { Card } from "@/components/ui/card";

export const StatusPanel = () => {
  return (
    <section className="py-12">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8 bg-gradient-to-r from-cyber-blue to-cyber-cyan bg-clip-text text-transparent">
            Live Status
          </h2>
        </div>
        <div className="mx-auto grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
          <Card className="neo-card backdrop-blur-sm hover:glow-box transition-all">
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Current Controller</h3>
                <p className="text-lg font-mono text-cyber-cyan">0xd8da...6273</p>
              </div>
            </div>
          </Card>
          <Card className="neo-card backdrop-blur-sm hover:glow-box transition-all">
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Top Stake</h3>
                <p className="text-3xl font-bold text-cyber-cyan">125.5 DOT</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
