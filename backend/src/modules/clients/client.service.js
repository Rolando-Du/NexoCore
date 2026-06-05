import { prisma } from "../../config/prisma.js";

const clientInclude = {
  locations: true,
  contacts: true,
};

const normalizeOptionalText = (value) => {
  if (!value) return null;

  const cleanValue = String(value).trim();

  return cleanValue || null;
};

const normalizeRequiredText = (value) => {
  return String(value).trim();
};

const normalizeEmail = (value) => {
  const cleanValue = normalizeOptionalText(value);

  return cleanValue ? cleanValue.toLowerCase() : null;
};

const normalizeClientPayload = (data) => {
  return {
    name: normalizeRequiredText(data.name),
    legalName: normalizeOptionalText(data.legalName),
    taxId: normalizeOptionalText(data.taxId),
    email: normalizeEmail(data.email),
    phone: normalizeOptionalText(data.phone),
  };
};

const normalizeLocationPayload = ({ tenantId, location }) => {
  return {
    tenantId,
    name: normalizeRequiredText(location.name),
    address: normalizeOptionalText(location.address),
    city: normalizeOptionalText(location.city),
    state: normalizeOptionalText(location.state),
    country: normalizeOptionalText(location.country),
    lat: location.lat ?? null,
    lng: location.lng ?? null,
  };
};

const normalizeContactPayload = ({ tenantId, contact }) => {
  return {
    tenantId,
    name: normalizeRequiredText(contact.name),
    email: normalizeEmail(contact.email),
    phone: normalizeOptionalText(contact.phone),
    role: normalizeOptionalText(contact.role),
  };
};

const validateClientUniqueness = async ({
  tenantId,
  taxId,
  email,
  excludeClientId,
}) => {
  if (taxId) {
    const existingTaxId = await prisma.client.findFirst({
      where: {
        tenantId,
        taxId,
        id: excludeClientId
          ? {
              not: excludeClientId,
            }
          : undefined,
      },
      select: {
        id: true,
      },
    });

    if (existingTaxId) {
      const error = new Error("Ya existe un cliente con ese CUIT / Tax ID");
      error.statusCode = 409;
      throw error;
    }
  }

  if (email) {
    const existingEmail = await prisma.client.findFirst({
      where: {
        tenantId,
        email,
        id: excludeClientId
          ? {
              not: excludeClientId,
            }
          : undefined,
      },
      select: {
        id: true,
      },
    });

    if (existingEmail) {
      const error = new Error("Ya existe un cliente con ese email");
      error.statusCode = 409;
      throw error;
    }
  }
};

export const createClient = async ({
  tenantId,
  userId,
  data,
  ip,
  userAgent,
}) => {
  const clientPayload = normalizeClientPayload(data);

  await validateClientUniqueness({
    tenantId,
    taxId: clientPayload.taxId,
    email: clientPayload.email,
  });

  const locations = (data.locations || []).map((location) =>
    normalizeLocationPayload({
      tenantId,
      location,
    })
  );

  const contacts = (data.contacts || []).map((contact) =>
    normalizeContactPayload({
      tenantId,
      contact,
    })
  );

  const result = await prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        tenantId,
        ...clientPayload,

        locations:
          locations.length > 0
            ? {
                create: locations,
              }
            : undefined,

        contacts:
          contacts.length > 0
            ? {
                create: contacts,
              }
            : undefined,
      },
      include: clientInclude,
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "CREATE",
        module: "clients",
        entity: "Client",
        entityId: client.id,
        newValue: {
          id: client.id,
          name: client.name,
          legalName: client.legalName,
          taxId: client.taxId,
          email: client.email,
          phone: client.phone,
          isActive: client.isActive,
        },
        metadata: {
          event: "CREATE_CLIENT",
          locationsCount: client.locations.length,
          contactsCount: client.contacts.length,
        },
        ip,
        userAgent,
      },
    });

    return client;
  });

  return result;
};

export const getClients = async ({ tenantId, includeInactive = true }) => {
  return prisma.client.findMany({
    where: {
      tenantId,
      isActive: includeInactive ? undefined : true,
    },
    include: clientInclude,
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
    include: clientInclude,
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

  const clientPayload = normalizeClientPayload({
    name: data.name ?? existingClient.name,
    legalName: data.legalName,
    taxId: data.taxId,
    email: data.email,
    phone: data.phone,
  });

  await validateClientUniqueness({
    tenantId,
    taxId: clientPayload.taxId,
    email: clientPayload.email,
    excludeClientId: clientId,
  });

  const result = await prisma.$transaction(async (tx) => {
    const updatedClient = await tx.client.update({
      where: {
        id: clientId,
      },
      data: clientPayload,
      include: clientInclude,
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "UPDATE",
        module: "clients",
        entity: "Client",
        entityId: updatedClient.id,
        oldValue: {
          id: existingClient.id,
          name: existingClient.name,
          legalName: existingClient.legalName,
          taxId: existingClient.taxId,
          email: existingClient.email,
          phone: existingClient.phone,
          isActive: existingClient.isActive,
        },
        newValue: {
          id: updatedClient.id,
          name: updatedClient.name,
          legalName: updatedClient.legalName,
          taxId: updatedClient.taxId,
          email: updatedClient.email,
          phone: updatedClient.phone,
          isActive: updatedClient.isActive,
        },
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

  if (!existingClient.isActive) {
    const error = new Error("El cliente ya se encuentra inactivo");
    error.statusCode = 409;
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
      include: clientInclude,
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "UPDATE",
        module: "clients",
        entity: "Client",
        entityId: disabledClient.id,
        oldValue: {
          id: existingClient.id,
          name: existingClient.name,
          isActive: existingClient.isActive,
        },
        newValue: {
          id: disabledClient.id,
          name: disabledClient.name,
          isActive: disabledClient.isActive,
        },
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