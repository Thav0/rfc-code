import { projectsDb } from '@/modules/database/index.js';
import { AppError } from '@/shared/utils.js';

type SetProjectColorResult = {
  color: string | null;
};

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/;

/**
 * Stores the color the user picked to tell projects apart in the sidebar.
 * Accepts a `#rrggbb` hex string; null or an empty string clears the color.
 */
export function setProjectColor(projectId: string, color: unknown): SetProjectColorResult {
  const normalizedProjectId = projectId.trim();
  if (!normalizedProjectId) {
    throw new AppError('projectId is required', {
      code: 'PROJECT_ID_REQUIRED',
      statusCode: 400,
    });
  }

  let normalizedColor: string | null = null;
  if (color !== null && color !== undefined && color !== '') {
    const candidate = typeof color === 'string' ? color.trim().toLowerCase() : '';
    if (!HEX_COLOR_PATTERN.test(candidate)) {
      throw new AppError('color must be a #rrggbb hex value or null', {
        code: 'INVALID_PROJECT_COLOR',
        statusCode: 400,
      });
    }
    normalizedColor = candidate;
  }

  if (!projectsDb.getProjectById(normalizedProjectId)) {
    throw new AppError('Project not found', {
      code: 'PROJECT_NOT_FOUND',
      statusCode: 404,
    });
  }

  projectsDb.updateProjectColorById(normalizedProjectId, normalizedColor);
  return { color: normalizedColor };
}
