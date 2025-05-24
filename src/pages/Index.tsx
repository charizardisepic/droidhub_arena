
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
      thumbnailUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
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
      thumbnailUrl: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73",
      batteryLevel: 65,
      uptime: "0h 0m",
      operatorCount: 0,
      topStake: 42.8,
      chargeRate: 1.8
    },
    { 
      id: "robot-3", 
      title: "Dubai", 
      isActive: false,
      viewerCount: 0,
      thumbnailUrl: "https://images.unsplash.com/photo-1555255707-c07966088b7b",
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
      thumbnailUrl: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a",
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
      thumbnailUrl: "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7",
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
      thumbnailUrl: "https://images.unsplash.com/photo-1558137623-ce933996c730",
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
