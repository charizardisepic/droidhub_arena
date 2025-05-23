
import { Card } from "@/components/ui/card";

export const HowItWorks = () => {
  const steps = [
    {
      title: "Stake Tokens",
      description: "Stake your DOT tokens to enter the control competition.",
      icon: "💰"
    },
    {
      title: "Become the Highest Staker",
      description: "Outbid others to become the controller.",
      icon: "🏆"
    },
    {
      title: "Control in Real Time",
      description: "Command the robot with exclusive access.",
      icon: "🤖"
    }
  ];

  return (
    <section className="py-16 bg-cyber-dark">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl glow">
            How It Works
          </h2>
          <p className="mt-4 text-muted-foreground">
            The one who stakes the most commands the machine. Think you can outbid the current ruler?
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={index} className="neo-card backdrop-blur-sm relative overflow-hidden group transition-all hover:translate-y-[-5px]">
              <div className="absolute top-0 right-0 rounded-bl-lg bg-cyber-blue/20 px-3 py-1 text-xs">
                Step {index + 1}
              </div>
              <div className="mb-4 text-4xl">{step.icon}</div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground mt-2">{step.description}</p>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-cyber-blue to-cyber-cyan group-hover:w-full transition-all duration-300"></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
