import { Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { prisma } from "../configs/prisma.js";
import { getAuth } from "@clerk/express";

// Get user credits

export const getUserCredits = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // If user doesn't exist, create them with default credits
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: "no-email@example.com", // Placeholder, will be updated by webhook
          name: "New User",
          image: "", // Placeholder image
          credits: 20, // Default free credits
        },
      });
    }

    res.json({ credits: user.credits });
  } catch (error: any) {
    console.error("getUserCredits error:", error);
    Sentry.captureException(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// get all user projects

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ projects });
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Get project by id

export const getProjectByID = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const projectId = req.params.projectId as string;

    const project = await prisma.project.findUnique({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ project });
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// publish / unpublish project

export const toggleProjectPublic = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const projectId = req.params.projectId as string;

    const project = await prisma.project.findUnique({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project?.generatedImage && !project?.generatedVideo) {
      return res.status(404).json({ message: "Image or Video not generated" });
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { isPublished: !project.isPublished },
    });

    res.json({ isPublished: !project.isPublished });
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
