import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { RobotFeedCard } from "@/components/RobotFeedCard";

const Index = () => {
  const robots = [
    { 
      id: "robot-1", 
      title: "London Explorer", 
      isActive: true, 
      viewerCount: 5,
      thumbnailUrl: "https://images.unsplash.com/photo-1661591958211-4366f80c7ec6?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      batteryLevel: 85,
      uptime: "4h 12m",
      operatorCount: 5,
      topStake: 125.5,
      chargeRate: 2.5
    },
    { 
      id: "robot-2", 
      title: "New York Explorer", 
      isActive: false,
      viewerCount: 0,
      thumbnailUrl: "https://images.unsplash.com/photo-1602940659805-770d1b3b9911?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      batteryLevel: 65,
      uptime: "2h 30m",
      operatorCount: 2,
      topStake: 88.1,
      chargeRate: 1.8
    },
    { 
      id: "robot-3", 
      title: "Dubai", 
      isActive: false,
      viewerCount: 0,
      thumbnailUrl: "https://images.unsplash.com/flagged/photo-1559717201-fbb671ff56b7?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      batteryLevel: 92,
      uptime: "0h 0m",
      operatorCount: 0,
      topStake: 35.2,
      chargeRate: 1.2
    },
    { 
      id: "robot-4", 
      title: "Monster Truck #1", 
      isActive: false,
      viewerCount: 0,
      thumbnailUrl: "https://www.monsterjam.com/wp-content/uploads/2023/11/jester-san-antonio.jpg",
      batteryLevel: 78,
      uptime: "0h 0m",
      operatorCount: 0,
      topStake: 28.5,
      chargeRate: 1.5
    },
    { 
      id: "robot-5", 
      title: "Duck Feeder", 
      isActive: false,
      viewerCount: 0,
      thumbnailUrl: "https://wdlh.co.uk/wp-content/uploads/2021/11/DSC9863-scaled.jpg",
      batteryLevel: 45,
      uptime: "0h 0m",
      operatorCount: 0,
      topStake: 18.3,
      chargeRate: 0.9
    },
    { 
      id: "robot-6", 
      title: "De Louvre GuideBot", 
      isActive: false,
      viewerCount: 0,
      thumbnailUrl: "https://images.unsplash.com/photo-1555255707-c07966088b7b",
      batteryLevel: 63,
      uptime: "0h 0m",
      operatorCount: 0,
      topStake: 15.7,
      chargeRate: 0.8
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <section className="container py-12">
          <h2 className="text-2xl font-bold mb-6">Available Robots</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {robots.map((robot) => (
              <RobotFeedCard key={robot.id} {...robot} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
