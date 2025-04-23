import { Clock, BarChart2, History, BookOpen, Edit } from "lucide-react";

export const NavBar = () => {
  return (
    <div className="fixed bottom-0 flex w-full max-w-md justify-around border-t border-[#51576d] bg-[#414559] py-3">
      <div className="flex flex-col items-center text-[#f4b8e4]">
        <Clock className="h-5 w-5" />
        <span className="mt-1 text-xs">Timer</span>
      </div>
      <div className="flex flex-col items-center text-[#b5bfe2]">
        <BarChart2 className="h-5 w-5" />
        <span className="mt-1 text-xs">Fasts</span>
      </div>
      <div className="flex flex-col items-center text-[#b5bfe2]">
        <History className="h-5 w-5" />
        <span className="mt-1 text-xs">History</span>
      </div>
      <div className="flex flex-col items-center text-[#b5bfe2]">
        <BookOpen className="h-5 w-5" />
        <span className="mt-1 text-xs">Learn</span>
      </div>
    </div>
  );
};
