"use client";

import { Code2, Cloud, MonitorPlay, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const ServicesSection = () => {
  const router = useRouter();

  const redirect = () => {
    router.replace("/contact");
  };

  return (
    <div className="flex flex-col justify-center items-center font-WorkSans my-20">
      <div className="max-w-6xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center">
          <h3 className="text-blue-600 text-xl uppercase font-medium mb-2">
            Platform Features
          </h3>

          <h1 className="text-3xl md:text-4xl font-medium text-gray-100 mb-4">
            A Powerful Collaborative IDE Built for Teams
          </h1>

          <p className="text-gray-300 mb-6">
            Work together in real time, deploy instantly, and code from
            anywhere. Our cloud-powered IDE helps teams build, test, and ship
            faster with seamless collaboration and smart development tools.
          </p>

          <button
            onClick={redirect}
            className="
              max-md:self-center
              text-lg text-white font-bold py-2 px-4 rounded-full w-40
              transition-all duration-300
              bg-white/10 
              backdrop-blur-xl 
              border border-white/20
              shadow-lg 
              hover:bg-white/15
            "
          >
            Contact Us
          </button>
        </div>

        {/* RIGHT SIDE — SERVICE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Real-time Collaboration */}
          <div
            className="
            p-6 rounded-xl shadow-lg flex flex-col items-center transition-all hover:scale-105
            bg-white/10 
            hover:bg-white/15
            border border-white/20 
            backdrop-blur-xl
          "
          >
            <Users className="w-12 h-12 text-blue-500 mb-4" />
            <h4 className="font-bold text-lg text-gray-200 mb-2">
              Real-time Collaboration
            </h4>
            <p className="text-gray-300 text-center">
              Edit code together instantly with live cursors and synced changes.
            </p>
          </div>

          {/* Cloud Workspace */}
          <div
            className="
            p-6 rounded-xl shadow-lg flex flex-col items-center transition-all hover:scale-105
            bg-white/10 
            hover:bg-white/15
            border border-white/20 
            backdrop-blur-xl
          "
          >
            <Cloud className="w-12 h-12 text-blue-500 mb-4" />
            <h4 className="font-bold text-lg text-gray-200 mb-2">
              Cloud Workspaces
            </h4>
            <p className="text-gray-300 text-center">
              Spin up environments instantly — no installs, no setup needed.
            </p>
          </div>

          {/* Live Preview */}
          <div
            className="
            p-6 rounded-xl shadow-lg flex flex-col items-center transition-all hover:scale-105
            bg-white/10 
                        hover:bg-white/15

            border border-white/20 
            backdrop-blur-xl
          "
          >
            <MonitorPlay className="w-12 h-12 text-blue-500 mb-4" />
            <h4 className="font-bold text-lg text-gray-200 mb-2">
              Live Preview
            </h4>
            <p className="text-gray-300 text-center">
              Preview code instantly with auto refresh and built-in server.
            </p>
          </div>

          {/* Smart Code Editor */}
          <div
            className="
            p-6 rounded-xl shadow-lg flex flex-col items-center transition-all hover:scale-105
            bg-white/10 
          hover:bg-white/15
            border border-white/20 
            backdrop-blur-xl
          "
          >
            <Code2 className="w-12 h-12 text-blue-500 mb-4" />
            <h4 className="font-bold text-lg text-gray-200 mb-2">
              Smart Code Editor
            </h4>
            <p className="text-gray-300 text-center">
              AI-powered suggestions, syntax highlighting & debugging tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;
