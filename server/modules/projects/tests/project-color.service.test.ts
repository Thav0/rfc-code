import assert from 'node:assert/strict';
import test from 'node:test';

import { projectsDb } from '@/modules/database/index.js';
import { setProjectColor } from '@/modules/projects/services/project-color.service.js';
import { AppError } from '@/shared/utils.js';

const PROJECT_ROW = {
  project_id: 'project-1',
  project_path: '/workspace/project-1',
  custom_project_name: 'project-1',
  isStarred: 0,
  isArchived: 0,
  notifyEnabled: 0,
  color: null,
};

function withStubbedDb(run: (captured: { projectId: string; color: string | null | undefined }) => void): void {
  const originalGetProjectById = projectsDb.getProjectById;
  const originalUpdateProjectColorById = projectsDb.updateProjectColorById;
  const captured: { projectId: string; color: string | null | undefined } = { projectId: '', color: undefined };

  try {
    projectsDb.getProjectById = (projectId: string) => (projectId === 'project-1' ? PROJECT_ROW : null);
    projectsDb.updateProjectColorById = (projectId: string, color: string | null) => {
      captured.projectId = projectId;
      captured.color = color;
    };
    run(captured);
  } finally {
    projectsDb.getProjectById = originalGetProjectById;
    projectsDb.updateProjectColorById = originalUpdateProjectColorById;
  }
}

const isAppError = (code: string, statusCode: number) => (error: unknown) =>
  error instanceof AppError && error.code === code && error.statusCode === statusCode;

test('setProjectColor throws when projectId is missing', () => {
  assert.throws(() => setProjectColor('   ', '#3b82f6'), isAppError('PROJECT_ID_REQUIRED', 400));
});

test('setProjectColor rejects values that are not #rrggbb hex', () => {
  withStubbedDb((captured) => {
    for (const invalid of ['blue', '#fff', '#12345g', 'url(x)', 42]) {
      assert.throws(() => setProjectColor('project-1', invalid), isAppError('INVALID_PROJECT_COLOR', 400));
    }
    assert.equal(captured.color, undefined);
  });
});

test('setProjectColor throws when project does not exist', () => {
  withStubbedDb(() => {
    assert.throws(() => setProjectColor('missing', '#3b82f6'), isAppError('PROJECT_NOT_FOUND', 404));
  });
});

test('setProjectColor stores a lowercased hex color', () => {
  withStubbedDb((captured) => {
    const result = setProjectColor('project-1', ' #3B82F6 ');
    assert.deepEqual(result, { color: '#3b82f6' });
    assert.equal(captured.projectId, 'project-1');
    assert.equal(captured.color, '#3b82f6');
  });
});

test('setProjectColor clears the color for null or an empty string', () => {
  withStubbedDb((captured) => {
    assert.deepEqual(setProjectColor('project-1', null), { color: null });
    assert.equal(captured.color, null);

    captured.color = undefined;
    assert.deepEqual(setProjectColor('project-1', ''), { color: null });
    assert.equal(captured.color, null);
  });
});
