import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = { value: string; label: string };

function OptionSelect({ id, options, value, onChange, placeholder }: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select items={options} value={value} onValueChange={(nextValue) => onChange(nextValue as string)}>
      <SelectTrigger id={id} className="w-full"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, enrollStudents, unenrollStudent } = useEnrollmentStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [formStudents, setFormStudents] = useState<string[]>([]);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");
  const studentAnchor = useComboboxAnchor();

  const studentName = (studentId: string) => {
    const student = students.find((item) => item.studentId === studentId);
    return student ? `${student.firstName} ${student.lastName}` : studentId;
  };
  const courseOptions: Option[] = courses.map((course) => ({
    value: course.courseCode,
    label: `${course.courseCode} — ${course.courseTitle}`,
  }));
  const studentOptions: Option[] = students.map((student) => ({
    value: student.studentId,
    label: `${student.studentId} — ${student.firstName} ${student.lastName}`,
  }));
  const availableStudentIds = useMemo(() => {
    if (!formCourse) return [];
    return students
      .filter((student) => !student.enrolledCourses.includes(formCourse))
      .map((student) => student.studentId);
  }, [formCourse, students]);

  const resetForm = () => {
    setFormCourse(null);
    setFormStudents([]);
  };
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetForm();
  };
  const handleEnroll = () => {
    if (!formCourse || formStudents.length === 0) return;
    enrollStudents(formCourse, formStudents);
    setDialogOpen(false);
    resetForm();
  };
  const visibleCourses = courses.filter((course) => {
    if (mode === "course") return filterCourse === "all" || course.courseCode === filterCourse;
    if (filterStudent === "all") return true;
    return students.find((student) => student.studentId === filterStudent)?.enrolledCourses.includes(course.courseCode) ?? false;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน</p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger render={<Button />}><Plus /> ลงทะเบียนให้นักศึกษา</DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>เลือกวิชาก่อน แล้วเลือกนักศึกษาที่ต้องการลงทะเบียนได้มากกว่าหนึ่งคน</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={(value) => {
                  setFormCourse(value);
                  setFormStudents([]);
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="formStudents">นักศึกษา</Label>
              <Combobox
                items={availableStudentIds}
                itemToStringLabel={(studentId) => studentOptions.find((item) => item.value === studentId)?.label ?? studentId}
                multiple
                disabled={!formCourse}
                value={formStudents}
                onValueChange={setFormStudents}
              >
                <ComboboxChips ref={studentAnchor} className={!formCourse ? "cursor-not-allowed opacity-50" : ""}>
                  {formStudents.map((studentId) => <ComboboxChip key={studentId}>{studentName(studentId)}</ComboboxChip>)}
                  <ComboboxChipsInput
                    id="formStudents"
                    disabled={!formCourse}
                    placeholder={!formCourse ? "กรุณาเลือกวิชาก่อน" : availableStudentIds.length === 0 ? "นักศึกษาทุกคนลงวิชานี้แล้ว" : "ค้นหานักศึกษา"}
                  />
                </ComboboxChips>
                <ComboboxContent anchor={studentAnchor}>
                  <ComboboxEmpty>ไม่พบนักศึกษาที่ลงทะเบียนได้</ComboboxEmpty>
                  <ComboboxList>
                    {availableStudentIds.map((studentId) => (
                      <ComboboxItem key={studentId} value={studentId}>
                        {studentOptions.find((item) => item.value === studentId)?.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={!formCourse || formStudents.length === 0} onClick={handleEnroll}>
              <Plus /> ลงทะเบียน ({formStudents.length} คน)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs value={mode} onValueChange={(value) => setMode(value as "course" | "student")}>
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect id="filterCourse" options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]} value={filterCourse} onChange={setFilterCourse} />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect id="filterStudent" options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]} value={filterStudent} onChange={setFilterStudent} />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold text-muted-foreground">รหัสวิชา</TableHead>
              <TableHead className="font-semibold text-muted-foreground">ชื่อวิชา</TableHead>
              <TableHead className="font-semibold text-muted-foreground">จำนวน นศ.</TableHead>
              <TableHead className="font-semibold text-muted-foreground">นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleCourses.length === 0 && <TableRow><TableCell colSpan={4} className="h-20 text-center text-muted-foreground">ไม่พบข้อมูลการลงทะเบียน</TableCell></TableRow>}
            {visibleCourses.map((course) => {
              const enrolledStudents = students.filter((student) => student.enrolledCourses.includes(course.courseCode));
              return (
                <TableRow key={course.courseCode}>
                  <TableCell className="font-medium">{course.courseCode}</TableCell>
                  <TableCell>{course.courseTitle}</TableCell>
                  <TableCell>{enrolledStudents.length}</TableCell>
                  <TableCell>
                    {enrolledStudents.length ? (
                      <div className="flex flex-wrap gap-1">
                        {enrolledStudents.map((student) => {
                          const fullName = `${student.firstName} ${student.lastName}`;
                          return (
                            <Badge key={student.studentId} variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              {fullName}
                              <button type="button" className="rounded-full opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`ยกเลิกการลงทะเบียน ${fullName}`} onClick={() => unenrollStudent(course.courseCode, student.studentId)}>
                                <X />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    ) : <span className="text-muted-foreground">ยังไม่มีนักศึกษาลงทะเบียน</span>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
