const uploadForm = document.getElementById('uploadForm');
const geojsonFileInput = document.getElementById('geojsonFile');
const fileList = document.getElementById('fileList');

// Admin access code
const adminAccessCode = "12345";

// Prompt for admin access
function requestAccess() {
    const inputCode = prompt("Enter the admin access code:");
    if (inputCode === adminAccessCode) {
        alert("Access granted!");
        fetchFiles();
    } else {
        alert("Access denied. Please enter the correct admin access code.");
        document.body.innerHTML = `<h1 class="text-center text-red-500 text-3xl mt-20">Unauthorized Access</h1>`;
    }
}


// Upload file
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = geojsonFileInput.files[0];
    if (!file) {
        alert('Please select a file before uploading.');
        return;
    }

    const formData = new FormData();
    formData.append('geojsonFile', file);

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
    });

    if (response.ok) {
        alert('File uploaded successfully!');
        fetchFiles();
    } else {
        alert('Failed to upload file.');
    }

    uploadForm.reset();
});

// Confirm deletion of a file
function confirmDeletion(fileName) {
    const confirmed = confirm(`Are you sure you want to delete the file "${fileName}"?`);
    if (confirmed) {
        deleteFile(fileName);
    }
}

// Delete file
async function deleteFile(fileName) {
    const response = await fetch(`/delete?file=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        alert('File deleted successfully!');
        fetchFiles();
    } else {
        alert('Failed to delete file.');
    }
}

// Rename file
function renameFile(oldFileName) {
    const newFileName = prompt(`Enter a new name for "${oldFileName}" (including .geojson):`);
    if (newFileName && newFileName.trim() !== "") {
        performRename(oldFileName, newFileName.trim());
    }
}

// Perform rename operation
async function performRename(oldFileName, newFileName) {
    const response = await fetch(`/rename`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldFileName, newFileName }),
    });

    if (response.ok) {
        alert(`File renamed to "${newFileName}" successfully!`);
        fetchFiles();
    } else {
        const errorMsg = await response.text();
        alert(`Failed to rename file: ${errorMsg}`);
    }
}

// Initial request for admin access
requestAccess();
