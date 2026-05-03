import React, { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/solid";

interface Course {
  id: number | string;
  name: string;
  status: "draft" | "published" | "archived"; 
  category: string;
  age_group?: string;
  lesson_count?: number;
  program_id?: number;
}

interface CoursePermissionSelectorProps {
  selectedCourses: (number | string)[];
  onChange: (courses: (number | string)[]) => void;
  courses: Course[];
  disabledCourseIds?: (number | string)[]; 
}

export const CoursePermissionSelector: React.FC<CoursePermissionSelectorProps> = ({
  selectedCourses,
  onChange,
  courses,
  disabledCourseIds = []
}) => {
  const [activeTab, setActiveTab] = useState<1 | 2>(1);

  // Logic group khóa học
  const groupedCourses = courses.reduce((acc, course) => {
    const program = course.program_id === 1 ? 1 : 2;
    const code = course.category || "Other";

    if (!acc[program]) acc[program] = {};
    if (!acc[program][code]) acc[program][code] = [];
    acc[program][code].push(course);

    return acc;
  }, {} as Record<number, Record<string, Course[]>>);

  const toggleCourse = (courseId: number | string) => {
    if (disabledCourseIds.includes(courseId)) return;

    if (selectedCourses.includes(courseId)) {
      onChange(selectedCourses.filter(id => id !== courseId));
    } else {
      onChange([...selectedCourses, courseId]);
    }
  };

  const toggleGroup = (groupCourses: Course[]) => {
    const availableCourses = groupCourses.filter(c => !disabledCourseIds.includes(c.id));
    const availableIds = availableCourses.map(c => c.id);

    if (availableIds.length === 0) return;

    const allSelected = availableIds.every(id => selectedCourses.includes(id));

    if (allSelected) {
      onChange(selectedCourses.filter(id => !availableIds.includes(id)));
    } else {
      const toAdd = availableIds.filter(id => !selectedCourses.includes(id));
      onChange([...selectedCourses, ...toAdd]);
    }
  };

  const program = activeTab === 1 ? 1 : 2;

  return (
    <div className="w-full bg-[#150a24] rounded-2xl border border-white/10 p-5 shadow-inner">
      <div className="flex gap-3 mb-6 p-1 bg-white/5 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab(1)}
          className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300 ${
            activeTab === 1
              ? "bg-[#9c00e5] text-white shadow-lg shadow-[#9c00e5]/30"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Robotic Essential
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(2)}
          className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300 ${
            activeTab === 2
              ? "bg-[#3c90ff] text-white shadow-lg shadow-[#3c90ff]/30"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Robotic Prime
        </button>
      </div>

      <div className="h-[400px] overflow-y-auto custom-scrollbar space-y-4 pr-2">
        {!groupedCourses[program] || Object.keys(groupedCourses[program]).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>Chưa có khóa học nào (Published)</p>
          </div>
        ) : (
          Object.entries(groupedCourses[program] || {}).map(([code, groupCourses]) => {
            const availableCourses = groupCourses.filter(c => !disabledCourseIds.includes(c.id));
            const isGroupDisabled = availableCourses.length === 0;
            
            const isGroupChecked = !isGroupDisabled && availableCourses.length > 0 && availableCourses.every(c => selectedCourses.includes(c.id));
            const isGroupIndeterminate = !isGroupDisabled && availableCourses.some(c => selectedCourses.includes(c.id)) && !isGroupChecked;
            const accentClass = activeTab === 1 ? "accent-[#9c00e5]" : "accent-[#3c90ff]";
            const borderColor = activeTab === 1 ? "border-[#9c00e5]" : "border-[#3c90ff]";

            return (
              <div key={code} className={`border-l-4 ${borderColor} bg-white/[0.03] rounded-r-xl overflow-hidden transition-all hover:bg-white/[0.05]`}>
                <div className="py-3 px-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isGroupChecked || isGroupIndeterminate}
                      onChange={() => toggleGroup(groupCourses)}
                      disabled={isGroupDisabled}
                      className={`w-5 h-5 rounded cursor-pointer ${accentClass} ${isGroupDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                    />
                    <label className={`text-base font-bold text-white ${isGroupDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      {code}
                    </label>
                  </div>
                  <span className="text-xs font-bold text-gray-400 bg-black/20 px-3 py-1 rounded-full border border-white/5">
                    {groupCourses.length} khóa học
                  </span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {groupCourses.map(course => {
                        const isSelected = selectedCourses.includes(course.id);
                        const isDisabled = disabledCourseIds.includes(course.id);
                        return (
                          <div
                            key={course.id}
                            className={`flex items-start space-x-3 p-3 rounded-lg border transition-all 
                              ${isDisabled 
                                ? "bg-black/40 border-white/5 opacity-50 cursor-not-allowed grayscale" 
                                : isSelected
                                    ? (activeTab === 1 ? "bg-[#9c00e5]/10 border-[#9c00e5]/40" : "bg-[#3c90ff]/10 border-[#3c90ff]/40") + " cursor-pointer"
                                    : "bg-transparent border-white/5 hover:bg-white/5 hover:border-white/20 cursor-pointer"
                              }
                            `}
                            onClick={() => toggleCourse(course.id)}
                          >
                            {isDisabled ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                                <input type="checkbox" checked={isSelected} onChange={() => {}} className={`w-4 h-4 rounded cursor-pointer mt-1 ${accentClass}`}/>
                            )}
                            <div className="grid gap-0.5">
                              <span className={`text-sm font-semibold leading-tight ${isSelected || isDisabled ? 'text-white' : 'text-gray-300'}`}>
                                {course.name}
                              </span>
                              <span className="text-xs text-gray-500">{isDisabled ? "Đã giao" : (course.age_group || "N/A")}</span>
                            </div>
                          </div>
                        );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};