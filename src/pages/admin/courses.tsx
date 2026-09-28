import { useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import type { Course } from "@/lib/types";

export default function AdminCoursesPage() {
  const { courses, addCourse, removeCourse, removeInstructor } = useEnrollmentStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [instructors, setInstructors] = useState<string[]>([]);
  const [instructorQuery, setInstructorQuery] = useState("");
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const instructorAnchor = useComboboxAnchor();

  const instructorOptions = useMemo(
    () => Array.from(new Set(courses.flatMap((course) => course.instructors ?? []))).sort((a, b) => a.localeCompare(b)),
    [courses],
  );
  const trimmedQuery = instructorQuery.trim();
  const queryMatchesExisting = instructorOptions.some(
    (name) => name.toLocaleLowerCase() === trimmedQuery.toLocaleLowerCase(),
  );
  const comboboxItems = Array.from(
    new Set([
      ...instructorOptions,
      ...instructors,
      ...(trimmedQuery && !queryMatchesExisting ? [trimmedQuery] : []),
    ]),
  );
  const trimmedCode = courseCode.trim();
  const duplicateCourse = courses.find(
    (course) => trimmedCode !== "" && course.courseCode.toLocaleLowerCase() === trimmedCode.toLocaleLowerCase(),
  );
  const formIsValid = trimmedCode !== "" && courseTitle.trim() !== "" && !duplicateCourse;

  const resetForm = () => {
    setCourseCode("");
    setCourseTitle("");
    setInstructors([]);
    setInstructorQuery("");
  };
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetForm();
  };
  const handleSubmit = () => {
    if (!formIsValid) return;
    addCourse({ courseCode: trimmedCode, courseTitle: courseTitle.trim(), instructors });
    setDialogOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่เพื่อให้เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาที่หน้า &quot;จัดการการลงทะเบียน&quot; ทันที
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger render={<Button />}>
            <Plus /> เพิ่มวิชา
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
              <DialogDescription>วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="courseCode">รหัสวิชา</Label>
                <Input
                  id="courseCode"
                  value={courseCode}
                  onChange={(event) => setCourseCode(event.target.value)}
                  placeholder="เช่น CS101"
                  aria-invalid={Boolean(duplicateCourse)}
                  aria-describedby={duplicateCourse ? "courseCodeError" : undefined}
                />
                {duplicateCourse && (
                  <p id="courseCodeError" className="text-xs text-destructive">
                    มีรหัสวิชา {duplicateCourse.courseCode} นี้แล้ว
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="courseTitle">ชื่อวิชา</Label>
                <Input id="courseTitle" value={courseTitle} onChange={(event) => setCourseTitle(event.target.value)} placeholder="ชื่อวิชา" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="instructors">ผู้สอน</Label>
                <Combobox
                  items={comboboxItems}
                  multiple
                  value={instructors}
                  inputValue={instructorQuery}
                  onInputValueChange={setInstructorQuery}
                  onValueChange={(value) => {
                    setInstructors(value);
                    setInstructorQuery("");
                  }}
                >
                  <ComboboxChips ref={instructorAnchor}>
                    {instructors.map((name) => <ComboboxChip key={name}>{name}</ComboboxChip>)}
                    <ComboboxChipsInput id="instructors" placeholder={instructors.length === 0 ? "เลือกหรือพิมพ์ชื่อผู้สอน" : "เพิ่มผู้สอน"} />
                  </ComboboxChips>
                  <ComboboxContent anchor={instructorAnchor}>
                    <ComboboxEmpty>ไม่พบผู้สอน</ComboboxEmpty>
                    <ComboboxList>
                      {comboboxItems.map((name) => (
                        <ComboboxItem key={name} value={name}>
                          {trimmedQuery && !queryMatchesExisting && name === trimmedQuery ? `+ เพิ่มผู้สอน "${name}"` : name}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>
            <DialogFooter>
              <Button disabled={!formIsValid} onClick={handleSubmit}>บันทึก</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold text-muted-foreground">รหัสวิชา</TableHead>
              <TableHead className="font-semibold text-muted-foreground">ชื่อวิชา</TableHead>
              <TableHead className="font-semibold text-muted-foreground">ผู้สอน</TableHead>
              <TableHead className="text-right font-semibold text-muted-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 && <TableRow><TableCell colSpan={4} className="h-20 text-center text-muted-foreground">ยังไม่มีวิชาเรียน</TableCell></TableRow>}
            {courses.map((course) => (
              <TableRow key={course.courseCode}>
                <TableCell className="font-medium">{course.courseCode}</TableCell>
                <TableCell>{course.courseTitle}</TableCell>
                <TableCell>
                  {course.instructors?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {course.instructors.map((name) => (
                        <Badge key={name} variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {name}
                          <button type="button" className="rounded-full opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`ลบผู้สอน ${name}`} onClick={() => removeInstructor(course.courseCode, name)}>
                            <X />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : <span className="text-muted-foreground">ยังไม่มีผู้สอน</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" aria-label={`ลบวิชา ${course.courseCode}`} onClick={() => setCourseToDelete(course)}>
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={Boolean(courseToDelete)} onOpenChange={(open) => { if (!open) setCourseToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบวิชา</AlertDialogTitle>
            <AlertDialogDescription>
              ต้องการลบวิชา {courseToDelete?.courseCode} — {courseToDelete?.courseTitle} ใช่หรือไม่? การลงทะเบียนของนักศึกษาในวิชานี้จะถูกลบด้วย
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => { if (courseToDelete) removeCourse(courseToDelete.courseCode); setCourseToDelete(null); }}>ลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
