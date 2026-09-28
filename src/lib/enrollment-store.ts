import { create } from "zustand";
import { persist } from "zustand/middleware";

import { courses as initialCourses, students as initialStudents } from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  addCourse: (course: Course) => void;
  removeCourse: (courseCode: string) => void;
  removeInstructor: (courseCode: string, name: string) => void;
  enrollStudents: (courseCode: string, studentIds: string[]) => void;
  unenrollStudent: (courseCode: string, studentId: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      addCourse: (course) =>
        set((state) => ({ courses: [...state.courses, course] })),

      removeCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter((course) => course.courseCode !== courseCode),
          students: state.students.map((student) => ({
            ...student,
            enrolledCourses: student.enrolledCourses.filter(
              (code) => code !== courseCode,
            ),
          })),
        })),

      removeInstructor: (courseCode, name) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.courseCode === courseCode
              ? {
                  ...course,
                  instructors: course.instructors?.filter(
                    (instructor) => instructor !== name,
                  ),
                }
              : course,
          ),
        })),

      enrollStudents: (courseCode, studentIds) =>
        set((state) => ({
          students: state.students.map((student) =>
            studentIds.includes(student.studentId) &&
            !student.enrolledCourses.includes(courseCode)
              ? {
                  ...student,
                  enrolledCourses: [...student.enrolledCourses, courseCode],
                }
              : student,
          ),
        })),

      unenrollStudent: (courseCode, studentId) =>
        set((state) => ({
          students: state.students.map((student) =>
            student.studentId === studentId
              ? {
                  ...student,
                  enrolledCourses: student.enrolledCourses.filter(
                    (code) => code !== courseCode,
                  ),
                }
              : student,
          ),
        })),
    }),
    {
      name: "lab16-2569-680610720",
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),
);
