const Notes = require('../../models/notes-models');

function createNote({ authorId, subjectId, note, timeStamp }) {

    if (timeStamp) {
        timeStamp = Date.now();
    }
    if (authorId && subjectId && note) {

        return new Notes({ authorId, subjectId, note, timeStamp }).save().then(
            res => {
                return res;
            },
            err => {
                throw err;
            }
        )

    } else {
        throw new Error('Invalid information for new note.');
    }
}

function deleteNote(noteId) {
    return Notes.findByIdAndDelete(noteId).then(
        deleted => {
            return deleted;
        },
        err => {
            throw err
        }
    )
}

function getNotes(subjectId) {
    return Notes.find({ subjectId: subjectId }).then(
        found => {
            return found;
        },
        err => {
            throw err;
        }
    )
}

function deleteAllNotesWhere(id) {
    return Notes.deleteMany({ subjectId: id }).then(
        deleted => {
            return deleted;
        },
        err => {
            throw err;
        }
    )
}

module.exports = {
    deleteNote,
    createNote,
    getNotes,
    deleteAllNotesWhere
}