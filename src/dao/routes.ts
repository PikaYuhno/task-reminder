import Database from "better-sqlite3";
import AufgabeModel from '../model/aufgabe.model'

class Api {
    static db = new Database('TasksDatabase.db');
    constructor() {
        this.init();
    }

    public init() {
        Api.db.prepare(`CREATE TABLE IF NOT EXISTS tasks(
        id varchar(255) PRIMARY KEY,
        fach varchar(255) NOT NULL,
        platform varchar(255) NOT NULL,
        deadline varchar(255) NOT NULL,
        moodle_id varchar(255));`).run();
        // db.prepare('INSERT INTO tasks (id, fach, platform, deadline, moodle_id) VALUES (?, ?, ?, ?, ?)')
        //     .run(generator(), 'Deutsch', 'Moodle', '2020.04.04 23:59', null);
        //this.deleteAll();
    }

    public findAll() {
        const all = Api.db.prepare('SELECT * FROM tasks').all();
        return all;
    }

    public findById(id: string) {
        const aufgabe = Api.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
        return new AufgabeModel(aufgabe.platform, aufgabe.fach, aufgabe.deadline, aufgabe.moodle_id, aufgabe.id);
    }

    public updateById(id: string, aufgabe: AufgabeModel) {
        Api.db.prepare('UPDATE tasks SET fach = ?, platform = ?, deadline = ? WHERE id = ?').run(aufgabe.subject, aufgabe.platform, aufgabe.deadline, id);
    }

    public updateByMooddleId(moodle_id: string, aufgabe: AufgabeModel) {
        Api.db.prepare('UPDATE tasks SET fach = ?, platform = ?, deadline = ? WHERE moodle_id = ?').run(aufgabe.subject, aufgabe.platform, aufgabe.deadline, moodle_id);
    }

    public deleteById(id: string) {
        Api.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    }

    public deleteAll() {
        Api.db.prepare('DELETE FROM tasks').run();
    }

    public insert(aufgabe: AufgabeModel) {
        Api.db.prepare('INSERT INTO tasks (id, fach, platform, deadline, moodle_id) VALUES(?, ?, ?, ?, ?)')
            .run(aufgabe.id, aufgabe.subject, aufgabe.platform, aufgabe.deadline, aufgabe.moodleId);
    }

    public findMoodleId(moodle_id: string) {
        let m_id = Api.db.prepare('SELECT moodle_id FROM tasks WHERE moodle_id = ?').get(moodle_id);
        return m_id;
    }

    public findByMoodleId(moodle_id: string) {
        return Api.db.prepare('SELECT * FROM tasks WHERE moodle_id=?').get(moodle_id);
    }

    public exists(id: string): boolean {
        const aufgabe = Api.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
        if (aufgabe != null) {
            return true;
        }
        return false;
    }
}

export default new Api();