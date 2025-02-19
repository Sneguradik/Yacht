export function fileToFormData(file: File): FormData {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return formData;
}
