import { prisma } from "../../config/prisma.js";

export const createClient = async ({
  tenantId,
  userId,
  data,
  ip,
  userAgent,
}) => {
  const result = await prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        tenantId,
        name: data.name,
        legalName: data.legalName,
        taxId: data.taxId,
        email: data.email,
        phone: data.phone,

        locations: {
          create: (data.locations || []).map((location) => ({
            tenantId,
            name: location.name,
            address: location.address,
            city: location.city,
            state: location.state,
            country: location.country,
            lat: location.lat,
            lng: location.lng,
          })),
        },

        contacts: {
          create: (data.contacts || []).map((contact) => ({
            tenantId,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            role: contact.role,
          })),
        },
      },
      include: {
        locations: true,
        contacts: true,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "CREATE",
        module: "clients",
        entity: "Client",
        entityId: client.id,
        newValue: client,
        metadata: {
          event: "CREATE_CLIENT",
        },
        ip,
        userAgent,
      },
    });

    return client;
  });

  return result;
};

export const getClients = async ({ tenantId }) => {
  return prisma.client.findMany({
    where: {
      tenantId,
    },
    include: {
      locations: true,
      contacts: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getClientById = async ({ tenantId, clientId }) => {
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      tenantId,
    },
    include: {
      locations: true,
      contacts: true,
    },
  });

  if (!client) {
    const error = new Error("Cliente no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return client;
};

export const updateClient = async ({
  tenantId,
  userId,
  clientId,
  data,
  ip,
  userAgent,
}) => {
  const existingClient = await prisma.client.findFirst({
    where: {
      id: clientId,
      tenantId,
    },
  });

  if (!existingClient) {
    const error = new Error("Cliente no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedClient = await tx.client.update({
      where: {
        id: clientId,
      },
      data: {
        name: data.name,
        legalName: data.legalName,
        taxId: data.taxId,
        email: data.email,
        phone: data.phone,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "UPDATE",
        module: "clients",
        entity: "Client",
        entityId: updatedClient.id,
        oldValue: existingClient,
        newValue: updatedClient,
        metadata: {
          event: "UPDATE_CLIENT",
        },
        ip,
        userAgent,
      },
    });

    return updatedClient;
  });

  return result;
};

export const disableClient = async ({
  tenantId,
  userId,
  clientId,
  ip,
  userAgent,
}) => {
  const existingClient = await prisma.client.findFirst({
    where: {
      id: clientId,
      tenantId,
    },
  });

  if (!existingClient) {
    const error = new Error("Cliente no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const result = await prisma.$transaction(async (tx) => {
    const disabledClient = await tx.client.update({
      where: {
        id: clientId,
      },
      data: {
        isActive: false,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "UPDATE",
        module: "clients",
        entity: "Client",
        entityId: disabledClient.id,
        oldValue: existingClient,
        newValue: disabledClient,
        metadata: {
          event: "DISABLE_CLIENT",
        },
        ip,
        userAgent,
      },
    });

    return disabledClient;
  });

  return result;
};