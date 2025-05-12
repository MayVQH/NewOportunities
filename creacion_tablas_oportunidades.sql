create table tipoUsuarios (
	id uniqueidentifier	primary key default newid(),
	nombreTipo nvarchar(80) not null unique
);

select * from tipoUsuarios

INSERT INTO tipoUsuarios (NombreTipo) VALUES ('Usuario'), ('Moderador');
INSERT INTO tipoUsuarios (NombreTipo) VALUES ('Comite');

CREATE TABLE Usuarios (
    id uniqueidentifier PRIMARY KEY default newid(),
    OAuthID VARCHAR(255) not null UNIQUE,
    Nombre VARCHAR(100),
    Email VARCHAR(255) UNIQUE,
    FechaRegistro DATETIME DEFAULT GETDATE(),
    tipoId uniqueidentifier not null,
	IsActive bit default 1 not null,
    FOREIGN KEY (tipoId) REFERENCES tipoUsuarios(id)
)

select * from Usuarios

create table PreguntasTema (
	id uniqueidentifier PRIMARY KEY default newid(),
	tema_id uniqueidentifier not null,
	texto nvarchar(max) not null,
	hora_creacion datetime default getdate(),
	flag bit default 1 null,
	foreign key (tema_id) references Temas(id)
)

create table Temas (
	id uniqueidentifier primary key default newid(),
	nombre nvarchar(512) not null,
	hora_creacion datetime default getdate(),
	flag bit default 1
)



select *  from Temas

select * from PreguntasTema

--delete from Usuarios

update Usuarios 
set tipoId = '7D532F89-A63E-4667-B7CB-A4B477A55017'
where Email = 'mayra.herrera@grupovanquish.com.mx'


SELECT t.id,
               t.nombreTipo,
                u.id,
                u.Nombre
                FROM Usuarios u
                JOIN tipoUsuarios t
                ON u.tipoId = t.id

INSERT INTO Usuarios (OAuthID,Nombre,Email,tipoId) VALUES (
'jjoglmfkmkfd','Daniel Alejandro','daniel.delacruz@grupovanquish.com.mx','D3B78325-006E-4230-AE7E-C188181AE8B8'
);

SELECT texto FROM PreguntasTema WHERE tema_id = '989C24E5-3361-471C-A6AC-57F0E47E5E59'

create table PreguntasClave (
	id uniqueidentifier primary key default newid(),
	nombre nvarchar(512) not null,
	hora_creacion datetime default getdate(),
	creador varchar(255) not null,
	flag bit default 1
)

create table PreguntasPreguntaClave (
	id uniqueidentifier PRIMARY KEY default newid(),
	pc_id uniqueidentifier not null,
	texto nvarchar(max) not null,
	hora_creacion datetime default getdate(),
	flag bit default 1 null,
	foreign key (pc_id) references PreguntasClave(id)
)

create table UsuariosPreguntaClave (
	id uniqueidentifier PRIMARY KEY default newid(),
	pc_id uniqueidentifier not null,
	usuario_id nvarchar(max) not null,
	hora_creacion datetime default getdate(),
	flag bit default 1 null,
	foreign key (pc_id) references PreguntasClave(id)
)

alter table PreguntasPreguntaClave 
add tema_id uniqueidentifier not null

alter table PreguntasPreguntaClave 
add preguntaTema_id uniqueidentifier not null

alter table PreguntasClave 
add creador VARCHAR(255) UNIQUE


select * from PreguntasClave

select * from PreguntasPreguntaClave

select * from UsuariosPreguntaClave

--delete from PreguntasClave
--delete from UsuariosPreguntaClave
--delete from PreguntasPreguntaClave
--drop table PreguntasClave

SELECT id
                        FROM PreguntasTema
                        WHERE tema_id = '989C24E5-3361-471C-A6AC-57F0E47E5E59' and texto = '¿Cuánto se necesita?'



SELECT i.name AS IndexName
FROM sys.indexes i
JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.is_unique = 1
  AND OBJECT_NAME(i.object_id) = 'PreguntasClave'
  AND c.name = 'creador';

  DROP INDEX UQ__Pregunta__97FE8CD50FDB2AF2 ON PreguntasClave;

  SELECT name 
FROM sys.key_constraints 
WHERE parent_object_id = OBJECT_ID('PreguntasClave') AND type = 'UQ';

ALTER TABLE PreguntasClave DROP CONSTRAINT UQ__Pregunta__97FE8CD50FDB2AF2;