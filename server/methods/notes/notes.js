/**
 * NOTES - CRUD
 */

const Notes = require('../../models/notes-models');

/**
 * @name createNote
 * @function
 * @description creates a new note in notes collection
 * @param {Object} param0 
 * @param {string} param0.authorId 
 * @param {string} param0.subjectId
 * @param {string} param0.note
 * @param {string} param0.timeStamp 
 */
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

/**
 * @name deleteNote
 * @function
 * @description deletes note by id
 * @param {string} noteId 
 */
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

/**
 * @name getNotes
 * @function
 * @description returns notes on the specified subject id
 * @param {string} subjectId 
 */
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

/**
 * @name deleteAllNotesWhere
 * @function
 * @description deletes all notes that have specified subject id
 * @param {string} id 
 */
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