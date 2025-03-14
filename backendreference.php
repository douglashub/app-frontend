
=== /Users/micaelsantana/Documents/app-backend/app/Http/Controllers/Controller.php ===

<?php

namespace App\Http\Controllers;

abstract class Controller
{
    //
}

=== /Users/micaelsantana/Documents/app-backend/app/Http/Controllers/MonitorController.php ===

<?php

namespace App\Http\Controllers;

use App\Services\MonitorService;
use App\Services\HateoasService;
use App\Services\LoggingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MonitorController extends Controller
{
    protected $monitorService;
    protected $hateoasService;
    protected $loggingService;

    public function __construct(MonitorService $monitorService, HateoasService $hateoasService, LoggingService $loggingService)
    {
        $this->monitorService = $monitorService;
        $this->hateoasService = $hateoasService;
        $this->loggingService = $loggingService;
    }

    public function index(): JsonResponse
    {
        $this->loggingService->logInfo('Fetching all monitores');
        $monitores = $this->monitorService->getAllMonitores();
        $response = [
            'data' => $monitores->items(),
            'meta' => [
                'current_page' => $monitores->currentPage(),
                'per_page' => $monitores->perPage(),
                'total' => $monitores->total(),
                'last_page' => $monitores->lastPage()
            ],
            '_links' => $this->hateoasService->generateCollectionLinks('monitores', $monitores)
        ];
        return response()->json($response);
    }
    
    public function show(int $id): JsonResponse
    {
        $this->loggingService->logInfo('Fetching monitor', ['id' => $id]);
        $monitor = $this->monitorService->getMonitorById($id);
        if (!$monitor) {
            $this->loggingService->logError('Monitor not found', ['id' => $id]);
            return response()->json(['message' => 'Monitor não encontrado'], Response::HTTP_NOT_FOUND);
        }

        $response = [
            'data' => $monitor,
            '_links' => $this->hateoasService->generateLinks('monitores', $id)
        ];

        return response()->json($response);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Creating new monitor');
            $validatedData = $request->validate([
                'nome' => 'required|string|max:255',
                'cpf' => 'required|string|max:14|unique:monitores,cpf',
                'telefone' => 'required|string|max:20',
                'endereco' => 'required|string',
                'data_contratacao' => 'required|date',
                'status' => 'required|in:Ativo,Ferias,Licenca,Inativo'
            ]);

            $monitor = $this->monitorService->createMonitor($validatedData);
            $this->loggingService->logInfo('Monitor created', ['id' => $monitor->id]);

            return response()->json([
                'data' => $monitor,
                '_links' => $this->hateoasService->generateLinks('monitores', $monitor->id)
            ], Response::HTTP_CREATED);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('monitores')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('monitores')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Updating monitor', ['id' => $id]);
            $validatedData = $request->validate([
                'nome' => 'sometimes|string|max:255',
                'cpf' => 'sometimes|string|max:14|unique:monitores,cpf,'.$id,
                'telefone' => 'sometimes|string|max:20',
                'endereco' => 'sometimes|string',
                'data_contratacao' => 'sometimes|date',
                'status' => 'sometimes|in:Ativo,Ferias,Licenca,Inativo'
            ]);

            $monitor = $this->monitorService->updateMonitor($id, $validatedData);
            if (!$monitor) {
                $this->loggingService->logError('Monitor update failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Monitor não encontrado',
                    '_links' => $this->hateoasService->generateCollectionLinks('monitores')
                ], Response::HTTP_NOT_FOUND);
            }

            $this->loggingService->logInfo('Monitor updated successfully', ['id' => $id]);
            return response()->json([
                'data' => $monitor,
                '_links' => $this->hateoasService->generateLinks('monitores', $id)
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('monitores')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('monitores')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Deleting monitor', ['id' => $id]);
            $deleted = $this->monitorService->deleteMonitor($id);
            if (!$deleted) {
                $this->loggingService->logError('Monitor deletion failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Monitor não encontrado',
                    '_links' => $this->hateoasService->generateCollectionLinks('monitores')
                ], Response::HTTP_NOT_FOUND);
            }

            $this->loggingService->logInfo('Monitor deleted successfully', ['id' => $id]);
            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            $this->loggingService->logError('Deletion error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('monitores')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function viagens(int $id): JsonResponse
    {
        $this->loggingService->logInfo('Fetching monitor viagens', ['id' => $id]);
        $monitor = $this->monitorService->getMonitorById($id);
        if (!$monitor) {
            $this->loggingService->logError('Monitor not found', ['id' => $id]);
            return response()->json(['message' => 'Monitor não encontrado'], Response::HTTP_NOT_FOUND);
        }

        $viagens = $this->monitorService->getMonitorViagens($id);
        return response()->json([
            'data' => $viagens,
            '_links' => $this->hateoasService->generateLinks('monitores', $id)
        ]);
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Http/Controllers/OnibusController.php ===

<?php

namespace App\Http\Controllers;

use App\Services\OnibusService;
use App\Services\HateoasService;
use App\Services\LoggingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OnibusController extends Controller
{
    protected $onibusService;
    protected $hateoasService;
    protected $loggingService;

    public function __construct(OnibusService $onibusService, HateoasService $hateoasService, LoggingService $loggingService)
    {
        $this->onibusService = $onibusService;
        $this->hateoasService = $hateoasService;
        $this->loggingService = $loggingService;
    }

    public function index(): JsonResponse
    {
        $this->loggingService->logInfo('Fetching all onibus');
        $onibus = $this->onibusService->getAllOnibus();
        $response = [
            'data' => $onibus,
            '_links' => $this->hateoasService->generateCollectionLinks('onibus')
        ];
        return response()->json($response);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Creating new onibus');
            $validatedData = $request->validate([
                'placa' => 'required|string|max:10',
                'modelo' => 'required|string|max:255',
                'capacidade' => 'required|integer',
                'ano_fabricacao' => 'required|integer',
                'status' => 'required|boolean'
            ]);

            $onibus = $this->onibusService->createOnibus($validatedData);
            $this->loggingService->logInfo('Onibus created', ['id' => $onibus->id]);

            return response()->json([
                'data' => $onibus,
                '_links' => $this->hateoasService->generateLinks('onibus', $onibus->id)
            ], Response::HTTP_CREATED);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('onibus')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                'error_details' => $e->getMessage(),
                '_links' => $this->hateoasService->generateCollectionLinks('onibus')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function show(int $id): JsonResponse
    {
        $this->loggingService->logInfo('Fetching onibus', ['id' => $id]);
        $onibus = $this->onibusService->getOnibusById($id);
        if (!$onibus) {
            $this->loggingService->logError('Onibus not found', ['id' => $id]);
            return response()->json(['message' => 'Ônibus não encontrado'], Response::HTTP_NOT_FOUND);
        }
        
        $response = [
            'data' => $onibus,
            '_links' => $this->hateoasService->generateLinks('onibus', $id)
        ];
        
        return response()->json($response);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Updating onibus', ['id' => $id]);
            $validatedData = $request->validate([
                'placa' => 'sometimes|string|max:10',
                'modelo' => 'sometimes|string|max:255',
                'capacidade' => 'sometimes|integer',
                'ano_fabricacao' => 'sometimes|integer',
                'status' => 'sometimes|boolean'
            ]);

            $onibus = $this->onibusService->updateOnibus($id, $validatedData);
            if (!$onibus) {
                $this->loggingService->logError('Onibus update failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Ônibus não encontrado',
                    '_links' => $this->hateoasService->generateCollectionLinks('onibus')
                ], Response::HTTP_NOT_FOUND);
            }
            
            $this->loggingService->logInfo('Onibus updated successfully', ['id' => $id]);
            return response()->json([
                'data' => $onibus,
                '_links' => $this->hateoasService->generateLinks('onibus', $id)
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('onibus')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                'error_details' => $e->getMessage(),
                '_links' => $this->hateoasService->generateCollectionLinks('onibus')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Deleting onibus', ['id' => $id]);
            $deleted = $this->onibusService->deleteOnibus($id);
            if (!$deleted) {
                $this->loggingService->logError('Onibus deletion failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Ônibus não encontrado',
                    '_links' => $this->hateoasService->generateCollectionLinks('onibus')
                ], Response::HTTP_NOT_FOUND);
            }
            
            $this->loggingService->logInfo('Onibus deleted successfully', ['id' => $id]);
            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            $this->loggingService->logError('Deletion error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                'error_details' => $e->getMessage(),
                '_links' => $this->hateoasService->generateCollectionLinks('onibus')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function viagens(int $id): JsonResponse
    {
        $this->loggingService->logInfo('Fetching onibus viagens', ['id' => $id]);
        $onibus = $this->onibusService->getOnibusById($id);
        if (!$onibus) {
            $this->loggingService->logError('Onibus not found', ['id' => $id]);
            return response()->json(['message' => 'Ônibus não encontrado'], Response::HTTP_NOT_FOUND);
        }

        $viagens = $this->onibusService->getOnibusViagens($id);
        return response()->json([
            'data' => $viagens,
            '_links' => $this->hateoasService->generateLinks('onibus', $id)
        ]);
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Http/Controllers/ViagemController.php ===

<?php

namespace App\Http\Controllers;

use App\Services\ViagemService;
use App\Services\HateoasService;
use App\Services\LoggingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ViagemController extends Controller
{
    protected $service;
    protected $hateoasService;
    protected $loggingService;

    public function __construct(ViagemService $service, HateoasService $hateoasService, LoggingService $loggingService)
    {
        $this->service = $service;
        $this->hateoasService = $hateoasService;
        $this->loggingService = $loggingService;
    }

    public function index(): JsonResponse
    {
        $this->loggingService->logInfo('Fetching all viagens');
        $viagens = $this->service->getAllViagens();
        $response = [
            'data' => $viagens,
            '_links' => $this->hateoasService->generateCollectionLinks('viagens')
        ];
        return response()->json($response);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Creating new viagem');
            
            // Formatar campos de hora antes da validação
            $this->formatTimeFields($request);
            
            $validatedData = $request->validate([
                'data_viagem' => 'required|date',
                'rota_id' => 'required|integer|exists:rotas,id',
                'onibus_id' => 'required|integer|exists:onibus,id',
                'motorista_id' => 'required|integer|exists:motoristas,id',
                'monitor_id' => 'nullable|integer|exists:monitores,id',
                'horario_id' => 'required|integer|exists:horarios,id',
                'hora_saida_prevista' => 'required|date_format:H:i',
                'hora_chegada_prevista' => 'nullable|date_format:H:i|after:hora_saida_prevista',
                'hora_saida_real' => 'nullable|date_format:H:i',
                'hora_chegada_real' => 'nullable|date_format:H:i',
                'status' => 'required|boolean',
                'observacoes' => 'nullable|string'
            ]);
    
            $viagem = $this->service->createViagem($validatedData);
            $this->loggingService->logInfo('Viagem created', ['id' => $viagem->id]);
            $relationships = [
                'rota' => $viagem->rota_id,
                'onibus' => $viagem->onibus_id,
                'motorista' => $viagem->motorista_id,
                'monitor' => $viagem->monitor_id,
                'horario' => $viagem->horario_id
            ];
    
            return response()->json([
                'data' => $viagem,
                '_links' => $this->hateoasService->generateLinks('viagens', $viagem->id, $relationships)
            ], Response::HTTP_CREATED);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('viagens')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('viagens')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    public function show(int $id): JsonResponse
    {
        $this->loggingService->logInfo('Fetching viagem', ['id' => $id]);
        $viagem = $this->service->getViagemById($id);
        if (!$viagem) {
            $this->loggingService->logError('Viagem not found', ['id' => $id]);
            return response()->json(['message' => 'Viagem não encontrada'], Response::HTTP_NOT_FOUND);
        }

        $relationships = [
            'rotas' => $viagem->rota_id,
            'onibus' => $viagem->onibus_id,
            'motoristas' => $viagem->motorista_id,
            'monitores' => $viagem->monitor_id,
            'horarios' => $viagem->horario_id
        ];

        $response = [
            'data' => $viagem,
            '_links' => $this->hateoasService->generateLinks('viagens', $id, $relationships)
        ];

        return response()->json($response);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Updating viagem', ['id' => $id]);
            
            // Formatar campos de hora antes da validação
            $this->formatTimeFields($request);
            
            $validatedData = $request->validate([
                'data_viagem' => 'sometimes|date',
                'rota_id' => 'sometimes|integer|exists:rotas,id',
                'onibus_id' => 'sometimes|integer|exists:onibus,id',
                'motorista_id' => 'sometimes|integer|exists:motoristas,id',
                'monitor_id' => 'nullable|integer|exists:monitores,id',
                'horario_id' => 'sometimes|integer|exists:horarios,id',
                
                // Modificar validação de campos de hora
                'hora_saida_prevista' => 'nullable|date_format:H:i',
                'hora_chegada_prevista' => 'nullable|date_format:H:i',
                'hora_saida_real' => 'nullable|date_format:H:i',
                'hora_chegada_real' => 'nullable|date_format:H:i',
                
                'status' => 'sometimes|boolean',
                'observacoes' => 'nullable|string'
            ]);
    
            $viagem = $this->service->updateViagem($id, $validatedData);
            if (!$viagem) {
                $this->loggingService->logError('Viagem update failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Viagem não encontrada',
                    '_links' => $this->hateoasService->generateCollectionLinks('viagens')
                ], Response::HTTP_NOT_FOUND);
            }
    
            $this->loggingService->logInfo('Viagem updated successfully', ['id' => $id]);
            
            $relationships = [
                'rotas' => $viagem->rota_id,
                'onibus' => $viagem->onibus_id,
                'motoristas' => $viagem->motorista_id,
                'monitores' => $viagem->monitor_id,
                'horarios' => $viagem->horario_id
            ];
            
            return response()->json([
                'data' => $viagem,
                '_links' => $this->hateoasService->generateLinks('viagens', $id, $relationships)
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('viagens')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('viagens')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Deleting viagem', ['id' => $id]);
            $deleted = $this->service->deleteViagem($id);
            if (!$deleted) {
                $this->loggingService->logError('Viagem deletion failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Viagem não encontrada',
                    '_links' => $this->hateoasService->generateCollectionLinks('viagens')
                ], Response::HTTP_NOT_FOUND);
            }

            $this->loggingService->logInfo('Viagem deleted successfully', ['id' => $id]);
            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            $this->loggingService->logError('Deletion error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('viagens')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Formata os campos de hora para garantir que estejam no padrão H:i
     * 
     * @param Request $request
     * @return void
     */
    private function formatTimeFields(Request $request): void
    {
        $timeFields = [
            'hora_saida_prevista',
            'hora_chegada_prevista',
            'hora_saida_real',
            'hora_chegada_real'
        ];
        
        foreach ($timeFields as $field) {
            if ($request->has($field) && $request->input($field)) {
                $time = $request->input($field);
                // Verifica se o formato precisa ser ajustado (se tem apenas um dígito para hora)
                if (preg_match('/^(\d{1}):(\d{2})$/', $time, $matches)) {
                    $hours = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
                    $request->merge([$field => "{$hours}:{$matches[2]}"]);
                    $this->loggingService->logInfo("Formatted time field {$field} from {$time} to {$hours}:{$matches[2]}");
                }
            }
        }
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Http/Controllers/HorarioController.php ===

<?php

namespace App\Http\Controllers;

use App\Services\HorarioService;
use App\Services\HateoasService;
use App\Services\LoggingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class HorarioController extends Controller
{
    protected $horarioService;
    protected $hateoasService;
    protected $loggingService;

    public function __construct(HorarioService $horarioService, HateoasService $hateoasService, LoggingService $loggingService)
    {
        $this->horarioService = $horarioService;
        $this->hateoasService = $hateoasService;
        $this->loggingService = $loggingService;
    }

    public function index(): JsonResponse
    {
        $this->loggingService->logInfo('Fetching all horarios');
        $horarios = $this->horarioService->getAllHorarios();
        $response = [
            'data' => $horarios,
            '_links' => $this->hateoasService->generateCollectionLinks('horarios')
        ];
        return response()->json($response);
    }

    public function show(int $id): JsonResponse
    {
        $this->loggingService->logInfo('Fetching horario', ['id' => $id]);
        $horario = $this->horarioService->getHorarioById($id);
        if (!$horario) {
            $this->loggingService->logError('Horario not found', ['id' => $id]);
            return response()->json(['message' => 'Horario não encontrado'], Response::HTTP_NOT_FOUND);
        }

        $response = [
            'data' => $horario,
            '_links' => $this->hateoasService->generateLinks('horarios', $id)
        ];

        return response()->json($response);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Creating new horario');
            $validatedData = $request->validate([
                'dias_semana' => 'required|array',
                'dias_semana.*' => 'integer|min:0|max:6',
                'hora_inicio' => 'required|date_format:H:i',
                'hora_fim' => 'required|date_format:H:i|after:hora_inicio',
                'status' => 'required|boolean'
            ]);

            $horario = $this->horarioService->createHorario($validatedData);
            $this->loggingService->logInfo('Horario created', ['id' => $horario->id]);

            return response()->json([
                'data' => $horario,
                '_links' => $this->hateoasService->generateLinks('horarios', $horario->id)
            ], Response::HTTP_CREATED);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('horarios')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('horarios')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Updating horario', ['id' => $id]);
            $validatedData = $request->validate([
                'dias_semana' => 'sometimes|array',
                'dias_semana.*' => 'integer|min:0|max:6',
                'hora_inicio' => 'sometimes|date_format:H:i',
                'hora_fim' => 'sometimes|date_format:H:i|after:hora_inicio',
                'status' => 'sometimes|boolean'
            ]);

            $horario = $this->horarioService->updateHorario($id, $validatedData);
            if (!$horario) {
                $this->loggingService->logError('Horario update failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Horário não encontrado',
                    '_links' => $this->hateoasService->generateCollectionLinks('horarios')
                ], Response::HTTP_NOT_FOUND);
            }

            $this->loggingService->logInfo('Horario updated successfully', ['id' => $id]);
            return response()->json([
                'data' => $horario,
                '_links' => $this->hateoasService->generateLinks('horarios', $id)
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('horarios')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('horarios')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Deleting horario', ['id' => $id]);
            $deleted = $this->horarioService->deleteHorario($id);
            if (!$deleted) {
                $this->loggingService->logError('Horario deletion failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Horário não encontrado',
                    '_links' => $this->hateoasService->generateCollectionLinks('horarios')
                ], Response::HTTP_NOT_FOUND);
            }

            $this->loggingService->logInfo('Horario deleted successfully', ['id' => $id]);
            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            $this->loggingService->logError('Deletion error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('horarios')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function viagens(int $id): JsonResponse
    {
        $this->loggingService->logInfo('Fetching horario viagens', ['id' => $id]);
        $horario = $this->horarioService->getHorarioById($id);
        if (!$horario) {
            $this->loggingService->logError('Horario not found', ['id' => $id]);
            return response()->json(['message' => 'Horário não encontrado'], Response::HTTP_NOT_FOUND);
        }

        $viagens = $this->horarioService->getHorarioViagens($id);
        return response()->json([
            'data' => $viagens,
            '_links' => $this->hateoasService->generateLinks('horarios', $id)
        ]);
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Http/Controllers/ParadaController.php ===

<?php

namespace App\Http\Controllers;

use App\Services\ParadaService;
use App\Services\HateoasService;
use App\Services\LoggingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;


class ParadaController extends Controller
{
    protected $paradaService;
    protected $hateoasService;
    protected $loggingService;

    public function __construct(ParadaService $paradaService, HateoasService $hateoasService, LoggingService $loggingService)
    {
        $this->paradaService = $paradaService;
        $this->hateoasService = $hateoasService;
        $this->loggingService = $loggingService;
    }

    public function index(): JsonResponse
    {
        $this->loggingService->logInfo('Fetching all paradas');
        $paradas = $this->paradaService->getAllParadas();
        $response = [
            'data' => $paradas,
            '_links' => $this->hateoasService->generateCollectionLinks('paradas')
        ];
        return response()->json($response);
    }

    public function show(int $id): JsonResponse
    {
        $this->loggingService->logInfo('Fetching parada', ['id' => $id]);
        $parada = $this->paradaService->getParadaById($id);
        if (!$parada) {
            $this->loggingService->logError('Parada not found', ['id' => $id]);
            return response()->json(['message' => 'Parada não encontrada'], Response::HTTP_NOT_FOUND);
        }

        $response = [
            'data' => $parada,
            '_links' => $this->hateoasService->generateLinks('paradas', $id)
        ];

        return response()->json($response);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Creating new parada');
            $validatedData = $request->validate([
                'nome' => 'required|string|max:255',
                'descricao' => 'nullable|string',
                'ponto_referencia' => 'nullable|string',
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
                'endereco' => 'required|string',
                'tipo' => 'required|in:Inicio,Intermediaria,Final',
                'status' => 'required|boolean'
            ]);

            $parada = $this->paradaService->createParada($validatedData);
            $this->loggingService->logInfo('Parada created', ['id' => $parada->id]);

            $response = [
                'data' => $parada,
                '_links' => $this->hateoasService->generateLinks('paradas', $parada->id)
            ];

            return response()->json($response, Response::HTTP_CREATED);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('paradas')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('paradas')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Updating parada', ['id' => $id]);
            $validatedData = $request->validate([
                'nome' => 'sometimes|string|max:255',
                'descricao' => 'nullable|string',
                'ponto_referencia' => 'nullable|string',
                'latitude' => 'sometimes|numeric',
                'longitude' => 'sometimes|numeric',
                'endereco' => 'sometimes|string',
                'tipo' => 'sometimes|in:Inicio,Intermediaria,Final',
                'status' => 'sometimes|boolean'
            ]);

            $parada = $this->paradaService->updateParada($id, $validatedData);
            if (!$parada) {
                $this->loggingService->logError('Parada update failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Parada não encontrada',
                    '_links' => $this->hateoasService->generateCollectionLinks('paradas')
                ], Response::HTTP_NOT_FOUND);
            }

            $this->loggingService->logInfo('Parada updated successfully', ['id' => $id]);
            $response = [
                'data' => $parada,
                '_links' => $this->hateoasService->generateLinks('paradas', $id)
            ];

            return response()->json($response);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('paradas')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('paradas')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Deleting parada', ['id' => $id]);
            $result = $this->paradaService->deleteParada($id);
            if (!$result) {
                $this->loggingService->logError('Parada deletion failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Parada não encontrada',
                    '_links' => $this->hateoasService->generateCollectionLinks('paradas')
                ], Response::HTTP_NOT_FOUND);
            }

            $this->loggingService->logInfo('Parada deleted successfully', ['id' => $id]);
            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            $this->loggingService->logError('Deletion error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('paradas')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Http/Controllers/MotoristaController.php ===

<?php

namespace App\Http\Controllers;

use App\Services\MotoristaService;
use App\Services\HateoasService;
use App\Services\LoggingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MotoristaController extends Controller
{
    protected $motoristaService;
    protected $hateoasService;
    protected $loggingService;

    public function __construct(MotoristaService $motoristaService, HateoasService $hateoasService, LoggingService $loggingService)
    {
        $this->motoristaService = $motoristaService;
        $this->hateoasService = $hateoasService;
        $this->loggingService = $loggingService;
    }

    public function index(): JsonResponse
    {
        $this->loggingService->logInfo('Fetching all motoristas');
        $motoristas = $this->motoristaService->getAllMotoristas();
        $response = [
            'data' => $motoristas,
            '_links' => $this->hateoasService->generateCollectionLinks('motoristas')
        ];
        return response()->json($response);
    }

    public function show(int $id): JsonResponse
    {
        $this->loggingService->logInfo('Fetching motorista', ['id' => $id]);
        $motorista = $this->motoristaService->getMotoristaById($id);
        if (!$motorista) {
            $this->loggingService->logError('Motorista not found', ['id' => $id]);
            return response()->json(['message' => 'Motorista não encontrado'], Response::HTTP_NOT_FOUND);
        }

        $response = [
            'data' => $motorista,
            '_links' => $this->hateoasService->generateLinks('motoristas', $id)
        ];

        return response()->json($response);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Creating new motorista');
            $validatedData = $request->validate([
                'nome' => 'required|string|max:255',
                'cpf' => 'required|string|max:14',
                'cnh' => 'required|string|max:20',
                'categoria_cnh' => 'required|string|max:5',
                'validade_cnh' => 'required|date',
                'telefone' => 'required|string|max:20',
                'endereco' => 'required|string',
                'data_contratacao' => 'required|date',
                'status' => 'required|boolean'
            ]);

            $motorista = $this->motoristaService->createMotorista($validatedData);
            $this->loggingService->logInfo('Motorista created', ['id' => $motorista->id]);

            return response()->json([
                'data' => $motorista,
                '_links' => $this->hateoasService->generateLinks('motoristas', $motorista->id)
            ], Response::HTTP_CREATED);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('motoristas')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('motoristas')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Updating motorista', ['id' => $id]);
            $validatedData = $request->validate([
                'nome' => 'sometimes|string|max:255',
                'cpf' => 'sometimes|string|max:14',
                'cnh' => 'sometimes|string|max:20',
                'categoria_cnh' => 'sometimes|string|max:5',
                'validade_cnh' => 'sometimes|date',
                'telefone' => 'sometimes|string|max:20',
                'endereco' => 'sometimes|string',
                'data_contratacao' => 'sometimes|date',
                'status' => 'sometimes|boolean'
            ]);

            $motorista = $this->motoristaService->updateMotorista($id, $validatedData);
            if (!$motorista) {
                $this->loggingService->logError('Motorista update failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Motorista não encontrado',
                    '_links' => $this->hateoasService->generateCollectionLinks('motoristas')
                ], Response::HTTP_NOT_FOUND);
            }

            $this->loggingService->logInfo('Motorista updated successfully', ['id' => $id]);
            return response()->json([
                'data' => $motorista,
                '_links' => $this->hateoasService->generateLinks('motoristas', $id)
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('motoristas')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('motoristas')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Deleting motorista', ['id' => $id]);
            $deleted = $this->motoristaService->deleteMotorista($id);
            if (!$deleted) {
                $this->loggingService->logError('Motorista deletion failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Motorista não encontrado',
                    '_links' => $this->hateoasService->generateCollectionLinks('motoristas')
                ], Response::HTTP_NOT_FOUND);
            }

            $this->loggingService->logInfo('Motorista deleted successfully', ['id' => $id]);
            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            $this->loggingService->logError('Deletion error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('motoristas')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function viagens(int $id): JsonResponse
    {
        $this->loggingService->logInfo('Fetching motorista viagens', ['id' => $id]);
        $motorista = $this->motoristaService->getMotoristaById($id);
        if (!$motorista) {
            $this->loggingService->logError('Motorista not found', ['id' => $id]);
            return response()->json(['message' => 'Motorista não encontrado'], Response::HTTP_NOT_FOUND);
        }

        $viagens = $this->motoristaService->getMotoristaViagens($id);
        return response()->json([
            'data' => $viagens,
            '_links' => $this->hateoasService->generateLinks('motoristas', $id)
        ]);
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Http/Controllers/PresencaController.php ===

<?php

namespace App\Http\Controllers;

use App\Services\PresencaService;
use App\Services\HateoasService;
use App\Services\LoggingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class PresencaController extends Controller
{
    protected $presencaService;
    protected $hateoasService;
    protected $loggingService;

    public function __construct(
        PresencaService $presencaService, 
        HateoasService $hateoasService, 
        LoggingService $loggingService
    ) {
        $this->presencaService = $presencaService;
        $this->hateoasService = $hateoasService;
        $this->loggingService = $loggingService;
    }

    /**
     * Retrieve all presencas
     */
    public function index(): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Fetching all presencas');
            
            $presencas = $this->presencaService->getAllPresencas();
            
            return response()->json([
                'data' => $presencas,
                'total' => $presencas->count(),
                '_links' => $this->hateoasService->generateCollectionLinks('presencas')
            ]);
        } catch (\Exception $e) {
            $this->loggingService->logError('Failed to fetch presencas', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Erro ao recuperar presenças',
                '_links' => $this->hateoasService->generateCollectionLinks('presencas')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieve presencas by viagem
     */
    public function getPresencasByViagem(int $viagemId): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Fetching presencas for viagem', ['viagem_id' => $viagemId]);
            
            $presencas = $this->presencaService->getPresencasByViagem($viagemId);
            
            return response()->json([
                'data' => $presencas,
                'total' => $presencas->count(),
                '_links' => $this->hateoasService->generateLinks('viagens', $viagemId)
            ]);
        } catch (\Exception $e) {
            $this->loggingService->logError('Failed to fetch presencas by viagem', [
                'viagem_id' => $viagemId,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Erro ao recuperar presenças da viagem',
                '_links' => $this->hateoasService->generateCollectionLinks('presencas')
            ], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * Retrieve presencas by aluno
     */
    public function getPresencasByAluno(int $alunoId): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Fetching presencas for aluno', ['aluno_id' => $alunoId]);
            
            $presencas = $this->presencaService->getPresencasByAluno($alunoId);
            
            return response()->json([
                'data' => $presencas,
                'total' => $presencas->count(),
                'presence_count' => $this->presencaService->countPresencasByAluno($alunoId),
                '_links' => $this->hateoasService->generateLinks('alunos', $alunoId)
            ]);
        } catch (\Exception $e) {
            $this->loggingService->logError('Failed to fetch presencas by aluno', [
                'aluno_id' => $alunoId,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Erro ao recuperar presenças do aluno',
                '_links' => $this->hateoasService->generateCollectionLinks('presencas')
            ], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * Show a specific presenca
     */
    public function show(int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Fetching presenca', ['id' => $id]);
            
            $presenca = $this->presencaService->getPresencaById($id);
            
            if (!$presenca) {
                return response()->json([
                    'message' => 'Presença não encontrada',
                    '_links' => $this->hateoasService->generateCollectionLinks('presencas')
                ], Response::HTTP_NOT_FOUND);
            }

            $relationships = [
                'viagem' => $presenca->viagem_id,
                'aluno' => $presenca->aluno_id
            ];

            return response()->json([
                'data' => $presenca,
                '_links' => $this->hateoasService->generateLinks('presencas', $id, $relationships)
            ]);
        } catch (\Exception $e) {
            $this->loggingService->logError('Failed to fetch presenca', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Erro ao recuperar presença',
                '_links' => $this->hateoasService->generateCollectionLinks('presencas')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create a new presenca
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Creating new presenca');
            
            $validatedData = $request->validate([
                'viagem_id' => 'required|integer|exists:viagens,id',
                'aluno_id' => 'required|integer|exists:alunos,id',
                'hora_embarque' => 'required|date_format:H:i',
                'presente' => 'required|boolean',
                'observacoes' => 'nullable|string|max:255'
            ]);

            $presenca = $this->presencaService->createPresenca($validatedData);
            
            $relationships = [
                'viagem' => $presenca->viagem_id,
                'aluno' => $presenca->aluno_id
            ];

            return response()->json([
                'data' => $presenca,
                '_links' => $this->hateoasService->generateLinks('presencas', $presenca->id, $relationships)
            ], Response::HTTP_CREATED);

        } catch (ValidationException $e) {
            $this->loggingService->logError('Validation failed for presenca creation', [
                'errors' => $e->errors()
            ]);

            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('presencas')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);

        } catch (\Exception $e) {
            $this->loggingService->logError('Error creating presenca', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Erro ao criar presença',
                '_links' => $this->hateoasService->generateCollectionLinks('presencas')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update an existing presenca
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Updating presenca', ['id' => $id]);
            
            $validatedData = $request->validate([
                'viagem_id' => 'sometimes|required|integer|exists:viagens,id',
                'aluno_id' => 'sometimes|required|integer|exists:alunos,id',
                'hora_embarque' => 'sometimes|required|date_format:H:i',
                'presente' => 'sometimes|required|boolean',
                'observacoes' => 'nullable|string|max:255'
            ]);

            $presenca = $this->presencaService->updatePresenca($id, $validatedData);
            
            if (!$presenca) {
                return response()->json([
                    'message' => 'Presença não encontrada',
                    '_links' => $this->hateoasService->generateCollectionLinks('presencas')
                ], Response::HTTP_NOT_FOUND);
            }

            $relationships = [
                'viagem' => $presenca->viagem_id,
                'aluno' => $presenca->aluno_id
            ];

            return response()->json([
                'data' => $presenca,
                '_links' => $this->hateoasService->generateLinks('presencas', $id, $relationships)
            ]);

        } catch (ValidationException $e) {
            $this->loggingService->logError('Validation failed for presenca update', [
                'id' => $id,
                'errors' => $e->errors()
            ]);

            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('presencas')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);

        } catch (\Exception $e) {
            $this->loggingService->logError('Error updating presenca', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Erro ao atualizar presença',
                '_links' => $this->hateoasService->generateCollectionLinks('presencas')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete a presenca
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Deleting presenca', ['id' => $id]);
            
            $deleted = $this->presencaService->deletePresenca($id);
            
            if (!$deleted) {
                return response()->json([
                    'message' => 'Presença não encontrada',
                    '_links' => $this->hateoasService->generateCollectionLinks('presencas')
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json(null, Response::HTTP_NO_CONTENT);

        } catch (\Exception $e) {
            $this->loggingService->logError('Error deleting presenca', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Erro ao excluir presença',
                '_links' => $this->hateoasService->generateCollectionLinks('presencas')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Http/Controllers/AlunoController.php ===

<?php

namespace App\Http\Controllers;

use App\Services\AlunoService;
use App\Services\HateoasService;
use App\Services\LoggingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AlunoController extends Controller
{
    protected $alunoService;
    protected $hateoasService;
    protected $loggingService;

    public function __construct(AlunoService $alunoService, HateoasService $hateoasService, LoggingService $loggingService)
    {
        $this->alunoService = $alunoService;
        $this->hateoasService = $hateoasService;
        $this->loggingService = $loggingService;
    }

    public function index(): JsonResponse
    {
        $this->loggingService->logInfo('Fetching all alunos');
        try {
            $alunos = $this->alunoService->getAllAlunos();
            
            // Verificação explícita para garantir que temos um objeto de paginação válido
            if (!$alunos) {
                throw new \Exception("Falha ao recuperar os dados de alunos");
            }
            
            // Assegurar que items() retorna um array, mesmo que vazio
            $data = method_exists($alunos, 'items') ? $alunos->items() : [];
            
            $response = [
                'data' => $data,
                'meta' => [
                    'current_page' => method_exists($alunos, 'currentPage') ? $alunos->currentPage() : 1,
                    'per_page' => method_exists($alunos, 'perPage') ? $alunos->perPage() : count($data),
                    'total' => method_exists($alunos, 'total') ? $alunos->total() : count($data),
                    'last_page' => method_exists($alunos, 'lastPage') ? $alunos->lastPage() : 1
                ],
                '_links' => $this->hateoasService->generateCollectionLinks('alunos', $alunos)
            ];
            
            return response()->json($response);
        } catch (\Exception $e) {
            $this->loggingService->logError('Error fetching alunos: ' . $e->getMessage());
            
            // Em caso de erro, ainda retorna uma estrutura JSON válida
            return response()->json([
                'data' => [],
                'meta' => [
                    'current_page' => 1,
                    'per_page' => 10,
                    'total' => 0,
                    'last_page' => 1
                ],
                '_links' => $this->hateoasService->generateCollectionLinks('alunos'),
                'error' => 'Erro ao recuperar alunos: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    public function show(int $id): JsonResponse
    {
        $this->loggingService->logInfo('Fetching aluno', ['id' => $id]);
        $aluno = $this->alunoService->getAlunoById($id);
        if (!$aluno) {
            $this->loggingService->logError('Aluno not found', ['id' => $id]);
            return response()->json([
                'message' => 'Aluno não encontrado',
                'status' => 'error'
            ], Response::HTTP_NOT_FOUND);
        }

        $response = [
            'data' => $aluno,
            '_links' => $this->hateoasService->generateLinks('alunos', $id)
        ];

        return response()->json($response);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Creating new aluno');
            $validatedData = $request->validate([
                'nome' => 'required|string|max:255',
                'descricao' => 'nullable|string',
                'data_nascimento' => 'required|date',
                'responsavel' => 'required|string|max:255',
                'telefone_responsavel' => 'required|string|max:20',
                'endereco' => 'required|string',
                'ponto_referencia' => 'nullable|string',
                'status' => 'required|boolean'
            ]);

            $aluno = $this->alunoService->createAluno($validatedData);
            $this->loggingService->logInfo('Aluno created', ['id' => $aluno->id]);

            return response()->json([
                'data' => $aluno,
                '_links' => $this->hateoasService->generateLinks('alunos', $aluno->id),
                'message' => 'Aluno criado com sucesso',
                'status' => 'success'
            ], Response::HTTP_CREATED);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('alunos'),
                'status' => 'error'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro no servidor: ' . $e->getMessage(),
                '_links' => $this->hateoasService->generateCollectionLinks('alunos'),
                'status' => 'error'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Updating aluno', ['id' => $id]);
            $validatedData = $request->validate([
                'nome' => 'sometimes|string|max:255',
                'descricao' => 'nullable|string',
                'data_nascimento' => 'sometimes|date',
                'responsavel' => 'sometimes|string|max:255',
                'telefone_responsavel' => 'sometimes|string|max:20',
                'endereco' => 'sometimes|string',
                'ponto_referencia' => 'nullable|string',
                'status' => 'sometimes|boolean'
            ]);

            $aluno = $this->alunoService->updateAluno($id, $validatedData);
            if (!$aluno) {
                $this->loggingService->logError('Aluno update failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Aluno não encontrado',
                    '_links' => $this->hateoasService->generateCollectionLinks('alunos'),
                    'status' => 'error'
                ], Response::HTTP_NOT_FOUND);
            }

            $this->loggingService->logInfo('Aluno updated successfully', ['id' => $id]);
            return response()->json([
                'data' => $aluno,
                '_links' => $this->hateoasService->generateLinks('alunos', $id),
                'message' => 'Aluno atualizado com sucesso',
                'status' => 'success'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('alunos'),
                'status' => 'error'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro no servidor: ' . $e->getMessage(),
                '_links' => $this->hateoasService->generateCollectionLinks('alunos'),
                'status' => 'error'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Deleting aluno', ['id' => $id]);
            $deleted = $this->alunoService->deleteAluno($id);
            if (!$deleted) {
                $this->loggingService->logError('Aluno deletion failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Aluno não encontrado',
                    '_links' => $this->hateoasService->generateCollectionLinks('alunos'),
                    'status' => 'error'
                ], Response::HTTP_NOT_FOUND);
            }

            $this->loggingService->logInfo('Aluno deleted successfully', ['id' => $id]);
            return response()->json([
                'message' => 'Aluno excluído com sucesso',
                'status' => 'success'
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            $this->loggingService->logError('Deletion error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao excluir: ' . $e->getMessage(),
                '_links' => $this->hateoasService->generateCollectionLinks('alunos'),
                'status' => 'error'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function presencas(int $id): JsonResponse
    {
        $this->loggingService->logInfo('Fetching aluno presencas', ['id' => $id]);
        $aluno = $this->alunoService->getAlunoById($id);
        if (!$aluno) {
            $this->loggingService->logError('Aluno not found', ['id' => $id]);
            return response()->json([
                'message' => 'Aluno não encontrado', 
                'status' => 'error'
            ], Response::HTTP_NOT_FOUND);
        }

        $presencas = $this->alunoService->getAlunoPresencas($id);
        return response()->json([
            'data' => $presencas,
            '_links' => $this->hateoasService->generateLinks('alunos', $id),
            'status' => 'success'
        ]);
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Http/Controllers/RotaController.php ===

<?php

namespace App\Http\Controllers;

use App\Services\RotaService;
use App\Services\HateoasService;
use App\Services\LoggingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class RotaController extends Controller
{
    protected $service;
    protected $hateoasService;
    protected $loggingService;

    public function __construct(RotaService $service, HateoasService $hateoasService, LoggingService $loggingService)
    {
        $this->service = $service;
        $this->hateoasService = $hateoasService;
        $this->loggingService = $loggingService;
    }

    public function index(): JsonResponse
    {
        $this->loggingService->logInfo('Fetching all rotas');
        $rotas = $this->service->getAllRotas();
        $response = [
            'data' => $rotas,
            '_links' => $this->hateoasService->generateCollectionLinks('rotas')
        ];
        return response()->json($response);
    }

    public function show(int $id): JsonResponse
    {
        $this->loggingService->logInfo('Fetching rota', ['id' => $id]);
        $rota = $this->service->getRotaById($id);
        if (!$rota) {
            $this->loggingService->logError('Rota not found', ['id' => $id]);
            return response()->json(['message' => 'Rota não encontrada'], Response::HTTP_NOT_FOUND);
        }

        $response = [
            'data' => $rota,
            '_links' => $this->hateoasService->generateLinks('rotas', $id)
        ];

        return response()->json($response);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Creating new rota');
            
            // Formatar campos de hora antes da validação
            $this->formatTimeFields($request);
            
            $validatedData = $request->validate([
                'nome' => 'required|string|max:255',
                'descricao' => 'nullable|string',
                'origem' => 'nullable|string|max:255',
                'destino' => 'nullable|string|max:255',
                'horario_inicio' => 'nullable|date_format:H:i',
                'horario_fim' => 'nullable|date_format:H:i|after_or_equal:horario_inicio',
                'tipo' => 'nullable|string|max:50',
                'distancia_km' => 'nullable|numeric',
                'tempo_estimado_minutos' => 'nullable|integer',
                'status' => 'sometimes|boolean'
            ]);
    
            $rota = $this->service->createRota($validatedData);
            $this->loggingService->logInfo('Rota created', ['id' => $rota->id]);
    
            return response()->json([
                'data' => $rota,
                '_links' => $this->hateoasService->generateLinks('rotas', $rota->id)
            ], Response::HTTP_CREATED);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('rotas')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('rotas')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Updating rota', ['id' => $id]);
            
            // Formatar campos de hora antes da validação
            $this->formatTimeFields($request);
            
            $validatedData = $request->validate([
                'nome' => 'sometimes|string|max:255',
                'descricao' => 'nullable|string',
                'origem' => 'sometimes|string|max:255',
                'destino' => 'sometimes|string|max:255',
                'horario_inicio' => 'sometimes|date_format:H:i',
                'horario_fim' => 'sometimes|date_format:H:i|after:horario_inicio',
                'status' => 'sometimes|boolean'
            ]);

            $rota = $this->service->updateRota($id, $validatedData);
            if (!$rota) {
                $this->loggingService->logError('Rota update failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Rota não encontrada',
                    '_links' => $this->hateoasService->generateCollectionLinks('rotas')
                ], Response::HTTP_NOT_FOUND);
            }

            $this->loggingService->logInfo('Rota updated successfully', ['id' => $id]);
            return response()->json([
                'data' => $rota,
                '_links' => $this->hateoasService->generateLinks('rotas', $id)
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->loggingService->logError('Validation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
                '_links' => $this->hateoasService->generateCollectionLinks('rotas')
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            $this->loggingService->logError('Server error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('rotas')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->loggingService->logInfo('Deleting rota', ['id' => $id]);
            $deleted = $this->service->deleteRota($id);
            if (!$deleted) {
                $this->loggingService->logError('Rota deletion failed', ['id' => $id]);
                return response()->json([
                    'message' => 'Rota não encontrada',
                    '_links' => $this->hateoasService->generateCollectionLinks('rotas')
                ], Response::HTTP_NOT_FOUND);
            }

            $this->loggingService->logInfo('Rota deleted successfully', ['id' => $id]);
            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            $this->loggingService->logError('Deletion error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                '_links' => $this->hateoasService->generateCollectionLinks('rotas')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getParadas(int $id): JsonResponse
    {
        $this->loggingService->logInfo('Fetching rota paradas', ['id' => $id]);
        $rota = $this->service->getRotaById($id);
        if (!$rota) {
            $this->loggingService->logError('Rota not found', ['id' => $id]);
            return response()->json(['message' => 'Rota não encontrada'], Response::HTTP_NOT_FOUND);
        }

        $paradas = $this->service->getRotaParadas($id);
        return response()->json([
            'data' => $paradas,
            '_links' => $this->hateoasService->generateLinks('rotas', $id)
        ]);
    }

    public function getViagens(int $id): JsonResponse
    {
        $this->loggingService->logInfo('Fetching rota viagens', ['id' => $id]);
        $rota = $this->service->getRotaById($id);
        if (!$rota) {
            $this->loggingService->logError('Rota not found', ['id' => $id]);
            return response()->json(['message' => 'Rota não encontrada'], Response::HTTP_NOT_FOUND);
        }

        $viagens = $this->service->getRotaViagens($id);
        return response()->json([
            'data' => $viagens,
            '_links' => $this->hateoasService->generateLinks('rotas', $id)
        ]);
    }
    
    /**
     * Formata os campos de hora para garantir que estejam no padrão H:i
     * 
     * @param Request $request
     * @return void
     */
    private function formatTimeFields(Request $request): void
    {
        $timeFields = [
            'horario_inicio',
            'horario_fim'
        ];
        
        foreach ($timeFields as $field) {
            if ($request->has($field) && $request->input($field)) {
                $time = $request->input($field);
                // Verifica se o formato precisa ser ajustado (se tem apenas um dígito para hora)
                if (preg_match('/^(\d{1}):(\d{2})$/', $time, $matches)) {
                    $hours = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
                    $request->merge([$field => "{$hours}:{$matches[2]}"]);
                    $this->loggingService->logInfo("Formatted time field {$field} from {$time} to {$hours}:{$matches[2]}");
                }
            }
        }
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Models/User.php ===

<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}

=== /Users/micaelsantana/Documents/app-backend/app/Models/Onibus.php ===

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Onibus extends Model
{
    protected $table = 'onibus';
    
    protected $fillable = [
        'placa',
        'capacidade',
        'modelo',
        'ano_fabricacao',
        'status'
    ];

    public function viagens(): HasMany
    {
        return $this->hasMany(Viagem::class);
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Models/Rota.php ===

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Rota extends Model
{
    protected $fillable = [
        'nome',
        'descricao',
        'tipo',
        'distancia_km',
        'tempo_estimado_minutos',
        'origem',
        'destino',
        'horario_inicio',
        'horario_fim',
        'status'
    ];

    public function horarios(): HasMany
    {
        return $this->hasMany(Horario::class);
    }

    public function viagens(): HasMany
    {
        return $this->hasMany(Viagem::class, 'rota_id');
    }

    public function subrotas(): BelongsToMany
    {
        return $this->belongsToMany(Rota::class, 'rota_subrotas', 'rota_principal_id', 'subrota_id')
            ->withPivot('ordem')
            ->withTimestamps();
    }
    
    public function paradas(): BelongsToMany
    {
        return $this->belongsToMany(Parada::class, 'rota_parada')
            ->withPivot('ordem', 'horario_estimado')
            ->withTimestamps();
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Models/Presenca.php ===

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Presenca extends Model
{
    protected $fillable = [
        'viagem_id',
        'aluno_id',
        'presente',
        'hora_embarque',
        'hora_desembarque',
        'observacoes'
    ];

    protected $casts = [
        'presente' => 'boolean'
    ];

    public function viagem(): BelongsTo
    {
        return $this->belongsTo(Viagem::class);
    }

    public function aluno(): BelongsTo
    {
        return $this->belongsTo(Aluno::class);
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Models/Monitor.php ===

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Monitor extends Model
{
    protected $table = 'monitores';
    
    protected $fillable = [
        'nome',
        'cpf',
        'telefone',
        'endereco',
        'data_contratacao',
        'status'
    ];

    public function viagens(): HasMany
    {
        return $this->hasMany(Viagem::class);
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Models/Aluno.php ===

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Aluno extends Model
{
    protected $fillable = [
        'nome',
        'descricao',
        'data_nascimento',
        'responsavel',
        'telefone_responsavel',
        'endereco',
        'ponto_referencia',
        'status'
    ];

    public function presencas(): HasMany
    {
        return $this->hasMany(Presenca::class);
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Models/Parada.php ===

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Parada extends Model
{
    protected $fillable = [
        'nome',
        'endereco',
        'ponto_referencia',
        'latitude',
        'longitude',
        'tipo',
        'status'
    ];
    
    public function rotas(): BelongsToMany
    {
        return $this->belongsToMany(Rota::class, 'rota_parada')
                    ->withPivot('ordem', 'horario_estimado')
                    ->withTimestamps();
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Models/Motorista.php ===

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Motorista extends Model
{
    protected $fillable = [
        'nome',
        'cpf',
        'cnh',
        'categoria_cnh',
        'validade_cnh',
        'telefone',
        'endereco',
        'data_contratacao',
        'status'
    ];

    public function viagens(): HasMany
    {
        return $this->hasMany(Viagem::class);
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Models/Horario.php ===

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Horario extends Model
{
    protected $fillable = [
        'rota_id',
        'hora_saida',
        'hora_chegada',
        'dias_semana',
        'ativo'
    ];

    protected $casts = [
        'dias_semana' => 'array',
        'ativo' => 'boolean'
    ];

    public function rota(): BelongsTo
    {
        return $this->belongsTo(Rota::class);
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Models/Viagem.php ===

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Viagem extends Model
{
    protected $table = 'viagens';
    
    protected $fillable = [
        'horario_id',
        'rota_id',
        'onibus_id',
        'motorista_id',
        'monitor_id',
        'data_viagem',
        'hora_saida_prevista',
        'hora_chegada_prevista',
        'hora_saida_real',
        'hora_chegada_real',
        'observacoes',
        'status',
    ];

    // Define the relationship between Viagem and Rota
    public function rota(): BelongsTo
    {
        return $this->belongsTo(Rota::class);
    }

    // Define the relationship between Viagem and Onibus
    public function onibus(): BelongsTo
    {
        return $this->belongsTo(Onibus::class);
    }

    // Define the relationship between Viagem and Motorista
    public function motorista(): BelongsTo
    {
        return $this->belongsTo(Motorista::class);
    }

    // Define the relationship between Viagem and Monitor (nullable)
    public function monitor(): BelongsTo
    {
        // Handle nullability of monitor_id (monitor can be null)
        return $this->belongsTo(Monitor::class)->withDefault(); // Add a default value for nullable relationships
    }

    // Define the relationship between Viagem and Presenca
    public function presencas(): HasMany
    {
        return $this->hasMany(Presenca::class);
    }
}

=== /Users/micaelsantana/Documents/app-backend/app/Services/LoggingService.php ===

<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class LoggingService
{
    public function logInfo(string $message, array $context = []): void
    {
        Log::channel('application')->info($message, $context);
    }

    public function logError(string $message, array $context = []): void
    {
        Log::channel('application')->error($message, $context);
    }

    public function logWarning(string $message, array $context = []): void
    {
        Log::channel('application')->warning($message, $context);
    }

    public function logDebug(string $message, array $context = []): void
    {
        Log::channel('application')->debug($message, $context);
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Services/HorarioService.php ===

<?php

namespace App\Services;

use App\Models\Horario;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class HorarioService
{
    public function getAllHorarios(int $perPage = 10): LengthAwarePaginator
    {
        return Horario::paginate($perPage);
    }

    public function getHorarioById(int $id): ?Horario
    {
        return Horario::find($id);
    }

    public function createHorario(array $data): Horario
    {
        return Horario::create($data);
    }

    public function updateHorario(int $id, array $data): ?Horario
    {
        $horario = $this->getHorarioById($id);
        if (!$horario) {
            return null;
        }

        $horario->update($data);
        return $horario->fresh();
    }

    public function deleteHorario(int $id): bool
    {
        $horario = $this->getHorarioById($id);
        if (!$horario) {
            return false;
        }

        return $horario->delete();
    }

    public function getHorarioViagens(int $id): Collection
    {
        $horario = $this->getHorarioById($id);
        if (!$horario) {
            return collect([]);
        }

        return $horario->viagens;
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Services/AlunoService.php ===

<?php

namespace App\Services;

use App\Models\Aluno;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class AlunoService
{
    public function getAllAlunos(int $perPage = 10): LengthAwarePaginator
    {
        return Aluno::paginate($perPage);
    }

    public function getAlunoById(int $id): ?Aluno
    {
        return Aluno::find($id);
    }

    public function createAluno(array $data): Aluno
    {
        return Aluno::create($data);
    }

    public function updateAluno(int $id, array $data): ?Aluno
    {
        $aluno = $this->getAlunoById($id);
        if (!$aluno) {
            return null;
        }

        $aluno->update($data);
        return $aluno->fresh();
    }

    public function deleteAluno(int $id): bool
    {
        $aluno = $this->getAlunoById($id);
        if (!$aluno) {
            return false;
        }

        return $aluno->delete();
    }

    public function getAlunoPresencas(int $id): Collection
    {
        $aluno = $this->getAlunoById($id);
        if (!$aluno) {
            return collect([]);
        }

        return $aluno->presencas;
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Services/ViagemService.php ===

<?php

namespace App\Services;

use App\Models\Viagem;
use Illuminate\Database\Eloquent\Collection;

class ViagemService
{
    public function getAllViagens(): Collection
    {
        return Viagem::all();
    }

    public function getViagemById(int $id): ?Viagem
    {
        return Viagem::find($id);
    }

    public function createViagem(array $data): Viagem
    {
        try {
            // Make sure all required fields are included
            $requiredFields = [
                'data_viagem',
                'rota_id',
                'onibus_id',
                'motorista_id',
                'horario_id',
                'hora_saida_prevista',
                'status'
            ];
            
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    throw new \InvalidArgumentException("Missing required field: {$field}");
                }
            }
            
            // Certifique-se de que todos os campos de hora estão corretamente formatados
            $data = $this->ensureTimeFormat($data);
            
            return Viagem::create($data);
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to create viagem: ' . $e->getMessage());
        }
    }

    public function updateViagem(int $id, array $data): ?Viagem
    {
        $viagem = $this->getViagemById($id);
        if (!$viagem) {
            return null;
        }
    
        try {
            // Remove null values to prevent overwriting existing data
            $filteredData = array_filter($data, function($value) {
                return $value !== null;
            });
    
            // Certifique-se de que todos os campos de hora estão corretamente formatados
            $filteredData = $this->ensureTimeFormat($filteredData);
    
            $viagem->update($filteredData);
            return $viagem->fresh();
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to update viagem: ' . $e->getMessage());
        }
    }

    public function deleteViagem(int $id): bool
    {
        $viagem = $this->getViagemById($id);
        if (!$viagem) {
            return false;
        }

        return $viagem->delete();
    }

    public function getViagemPresencas(int $id): Collection
    {
        $viagem = $this->getViagemById($id);
        if (!$viagem) {
            return collect([]);
        }

        return $viagem->presencas;
    }
    
    /**
     * Garante que todos os campos de hora estejam no formato correto
     *
     * @param array $data
     * @return array
     */
    private function ensureTimeFormat(array $data): array
    {
        $timeFields = [
            'hora_saida_prevista',
            'hora_chegada_prevista',
            'hora_saida_real',
            'hora_chegada_real'
        ];
        
        foreach ($timeFields as $field) {
            if (isset($data[$field]) && $data[$field]) {
                $time = $data[$field];
                if (preg_match('/^(\d{1,2}):(\d{2})$/', $time, $matches)) {
                    $hours = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
                    $data[$field] = "{$hours}:{$matches[2]}";
                }
            }
        }
        
        return $data;
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Services/HateoasService.php ===

<?php

namespace App\Services;

use Illuminate\Pagination\LengthAwarePaginator;

class HateoasService
{
    public function generateLinks(string $resourceType, int $id, array $relationships = []): array
    {
        $links = [
            'self' => [
                'href' => url("/api/{$resourceType}/{$id}"),
                'method' => 'GET'
            ],
            'update' => [
                'href' => url("/api/{$resourceType}/{$id}"),
                'method' => 'PUT'
            ],
            'delete' => [
                'href' => url("/api/{$resourceType}/{$id}"),
                'method' => 'DELETE'
            ]
        ];

        // Add collection link
        $links['collection'] = [
            'href' => url("/api/{$resourceType}"),
            'method' => 'GET'
        ];

        foreach ($relationships as $relation => $ids) {
            if (is_array($ids)) {
                $links[$relation] = array_map(function($relatedId) use ($relation) {
                    return [
                        'href' => url("/api/{$relation}/{$relatedId}"),
                        'method' => 'GET'
                    ];
                }, $ids);
            } else {
                $links[$relation] = [
                    'href' => url("/api/{$relation}/{$ids}"),
                    'method' => 'GET'
                ];
            }
        }

        return $links;
    }

    public function generateCollectionLinks(string $resourceType, ?LengthAwarePaginator $paginator = null): array
    {
        $links = [
            'self' => [
                'href' => url("/api/{$resourceType}"),
                'method' => 'GET'
            ],
            'create' => [
                'href' => url("/api/{$resourceType}"),
                'method' => 'POST'
            ]
        ];

        if ($paginator) {
            if ($paginator->hasMorePages()) {
                $links['next'] = [
                    'href' => $paginator->nextPageUrl(),
                    'method' => 'GET'
                ];
            }
            
            if ($paginator->currentPage() > 1) {
                $links['prev'] = [
                    'href' => $paginator->previousPageUrl(),
                    'method' => 'GET'
                ];
            }
            
            $links['first'] = [
                'href' => $paginator->url(1),
                'method' => 'GET'
            ];
            
            $links['last'] = [
                'href' => $paginator->url($paginator->lastPage()),
                'method' => 'GET'
            ];
        }

        return $links;
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Services/MotoristaService.php ===

<?php

namespace App\Services;

use App\Models\Motorista;
use Illuminate\Database\Eloquent\Collection;

class MotoristaService
{
    public function getAllMotoristas(): Collection
    {
        return Motorista::all();
    }

    public function getMotoristaById(int $id): ?Motorista
    {
        return Motorista::find($id);
    }

    public function createMotorista(array $data): Motorista
    {
        return Motorista::create($data);
    }

    public function updateMotorista(int $id, array $data): ?Motorista
    {
        $motorista = $this->getMotoristaById($id);
        if (!$motorista) {
            return null;
        }

        $motorista->update($data);
        return $motorista->fresh();
    }

    public function deleteMotorista(int $id): bool
    {
        $motorista = $this->getMotoristaById($id);
        if (!$motorista) {
            return false;
        }

        return $motorista->delete();
    }

    public function getMotoristaViagens(int $id): Collection
    {
        $motorista = $this->getMotoristaById($id);
        if (!$motorista) {
            return collect([]);
        }

        return $motorista->viagens;
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Services/MonitorService.php ===

<?php

namespace App\Services;

use App\Models\Monitor;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class MonitorService
{
    public function getAllMonitores(int $perPage = 10): LengthAwarePaginator
    {
        return Monitor::paginate($perPage);
    }

    public function getMonitorById(int $id): ?Monitor
    {
        return Monitor::find($id);
    }

    public function createMonitor(array $data): Monitor
    {
        return Monitor::create($data);
    }

    public function updateMonitor(int $id, array $data): ?Monitor
    {
        $monitor = $this->getMonitorById($id);
        if (!$monitor) {
            return null;
        }

        $monitor->update($data);
        return $monitor->fresh();
    }

    public function deleteMonitor(int $id): bool
    {
        $monitor = $this->getMonitorById($id);
        if (!$monitor) {
            return false;
        }

        return $monitor->delete();
    }

    public function getMonitorViagens(int $id): Collection
    {
        $monitor = $this->getMonitorById($id);
        if (!$monitor) {
            return collect([]);
        }

        return $monitor->viagens;
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Services/PresencaService.php ===

<?php

namespace App\Services;

use App\Models\Presenca;
use App\Models\Aluno;
use App\Models\Viagem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PresencaService
{
    /**
     * Retrieve all presencas with related models
     */
    public function getAllPresencas(): Collection
    {
        try {
            return Presenca::with(['aluno', 'viagem'])->get();
        } catch (\Exception $e) {
            Log::channel('application')->error('Error retrieving all presencas', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Find a specific presenca by ID with related models
     */
    public function getPresencaById(int $id): ?Presenca
    {
        try {
            return Presenca::with(['aluno', 'viagem'])->find($id);
        } catch (\Exception $e) {
            Log::channel('application')->error('Error finding presenca', [
                'id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Create a new presenca with validation and transaction
     */
    public function createPresenca(array $data): Presenca
    {
        return DB::transaction(function () use ($data) {
            try {
                // Validate relationships
                $viagem = Viagem::findOrFail($data['viagem_id']);
                $aluno = Aluno::findOrFail($data['aluno_id']);

                // Prepare data for creation
                $presencaData = [
                    'viagem_id' => $data['viagem_id'],
                    'aluno_id' => $data['aluno_id'],
                    'hora_embarque' => $data['hora_embarque'],
                    'presente' => $data['presente'],
                    'observacoes' => $data['observacoes'] ?? null
                ];

                // Create presenca
                $presenca = Presenca::create($presencaData);

                // Log successful creation
                Log::channel('application')->info('Presenca created successfully', [
                    'id' => $presenca->id,
                    'viagem_id' => $presenca->viagem_id,
                    'aluno_id' => $presenca->aluno_id
                ]);

                return $presenca->refresh();

            } catch (\Exception $e) {
                // Log creation error
                Log::channel('application')->error('Error creating presenca', [
                    'data' => $data,
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        });
    }

    /**
     * Update an existing presenca
     */
    public function updatePresenca(int $id, array $data): ?Presenca
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                // Find the existing presenca
                $presenca = $this->getPresencaById($id);
                
                if (!$presenca) {
                    Log::channel('application')->warning('Presenca not found for update', [
                        'id' => $id
                    ]);
                    return null;
                }

                // Validate relationships if provided
                if (isset($data['viagem_id'])) {
                    Viagem::findOrFail($data['viagem_id']);
                }

                if (isset($data['aluno_id'])) {
                    Aluno::findOrFail($data['aluno_id']);
                }

                // Update the presenca
                $presenca->update($data);

                // Refresh the model to get updated data
                $updatedPresenca = $presenca->refresh();

                // Log successful update
                Log::channel('application')->info('Presenca updated successfully', [
                    'id' => $id,
                    'updated_data' => $data
                ]);

                return $updatedPresenca;

            } catch (\Exception $e) {
                // Log update error
                Log::channel('application')->error('Error updating presenca', [
                    'id' => $id,
                    'data' => $data,
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        });
    }

    /**
     * Delete a presenca
     */
    public function deletePresenca(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                // Find the presenca
                $presenca = $this->getPresencaById($id);
                
                if (!$presenca) {
                    Log::channel('application')->warning('Presenca not found for deletion', [
                        'id' => $id
                    ]);
                    return false;
                }

                // Delete the presenca
                $deleted = $presenca->delete();

                // Log successful deletion
                Log::channel('application')->info('Presenca deleted successfully', [
                    'id' => $id
                ]);

                return $deleted;

            } catch (\Exception $e) {
                // Log deletion error
                Log::channel('application')->error('Error deleting presenca', [
                    'id' => $id,
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        });
    }

    /**
     * Get presencas for a specific viagem
     */
    public function getPresencasByViagem(int $viagemId): Collection
    {
        try {
            // Verify viagem exists
            Viagem::findOrFail($viagemId);

            return Presenca::where('viagem_id', $viagemId)
                ->with(['aluno', 'viagem'])
                ->get();
        } catch (\Exception $e) {
            Log::channel('application')->error('Error retrieving presencas by viagem', [
                'viagem_id' => $viagemId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Get presencas for a specific aluno
     */
    public function getPresencasByAluno(int $alunoId): Collection
    {
        try {
            // Verify aluno exists
            Aluno::findOrFail($alunoId);

            return Presenca::where('aluno_id', $alunoId)
                ->with(['aluno', 'viagem'])
                ->get();
        } catch (\Exception $e) {
            Log::channel('application')->error('Error retrieving presencas by aluno', [
                'aluno_id' => $alunoId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Count presencas for a specific aluno
     */
    public function countPresencasByAluno(int $alunoId): int
    {
        try {
            // Verify aluno exists
            Aluno::findOrFail($alunoId);

            return Presenca::where('aluno_id', $alunoId)
                ->where('presente', true)
                ->count();
        } catch (\Exception $e) {
            Log::channel('application')->error('Error counting presencas by aluno', [
                'aluno_id' => $alunoId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Services/RotaService.php ===

<?php

namespace App\Services;

use App\Models\Rota;
use Illuminate\Database\Eloquent\Collection;

class RotaService
{
    public function getAllRotas(): Collection
    {
        return Rota::all();
    }

    public function getRotaById(int $id): ?Rota
    {
        return Rota::find($id);
    }

    public function createRota(array $data): Rota
    {
        // Set default values if not provided
        $data['tipo'] = $data['tipo'] ?? '';
        $data['status'] = $data['status'] ?? true;
        
        // Garante que os campos de hora estão no formato correto
        $data = $this->ensureTimeFormat($data);
    
        return Rota::create($data);
    }

    public function updateRota(int $id, array $data): ?Rota
    {
        $rota = $this->getRotaById($id);
        if (!$rota) {
            return null;
        }
        
        // Garante que os campos de hora estão no formato correto
        $data = $this->ensureTimeFormat($data);

        $rota->update($data);
        return $rota->fresh();
    }

    public function deleteRota(int $id): bool
    {
        $rota = $this->getRotaById($id);
        if (!$rota) {
            return false;
        }

        return $rota->delete();
    }

    public function getRotaParadas(int $id): Collection
    {
        $rota = $this->getRotaById($id);
        if (!$rota) {
            return collect([]);
        }

        return $rota->paradas;
    }

    public function getRotaViagens(int $id): Collection
    {
        $rota = $this->getRotaById($id);
        if (!$rota) {
            return collect([]);
        }

        return $rota->viagens;
    }
    
    /**
     * Garante que todos os campos de hora estejam no formato correto
     *
     * @param array $data
     * @return array
     */
    private function ensureTimeFormat(array $data): array
    {
        $timeFields = [
            'horario_inicio',
            'horario_fim'
        ];
        
        foreach ($timeFields as $field) {
            if (isset($data[$field]) && $data[$field]) {
                $time = $data[$field];
                if (preg_match('/^(\d{1,2}):(\d{2})$/', $time, $matches)) {
                    $hours = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
                    $data[$field] = "{$hours}:{$matches[2]}";
                }
            }
        }
        
        return $data;
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Services/ParadaService.php ===

<?php

namespace App\Services;

use App\Models\Parada;
use Illuminate\Database\Eloquent\Collection;

class ParadaService
{
    public function getAllParadas(): Collection
    {
        return Parada::all();
    }

    public function getParadaById(int $id): ?Parada
    {
        return Parada::find($id);
    }

    public function createParada(array $data): Parada
    {
        return Parada::create($data);
    }

    public function updateParada(int $id, array $data): ?Parada
    {
        $parada = $this->getParadaById($id);
        if (!$parada) {
            return null;
        }

        $parada->update($data);
        return $parada->fresh();
    }

    public function deleteParada(int $id): bool
    {
        $parada = $this->getParadaById($id);
        if (!$parada) {
            return false;
        }

        return $parada->delete();
    }

    public function getParadaRotas(int $id): Collection
    {
        $parada = $this->getParadaById($id);
        if (!$parada) {
            return collect([]);
        }

        return $parada->rotas;
    }
}
=== /Users/micaelsantana/Documents/app-backend/app/Services/OnibusService.php ===

<?php

namespace App\Services;

use App\Models\Onibus;
use Illuminate\Database\Eloquent\Collection;

class OnibusService
{
    public function getAllOnibus(): Collection
    {
        return Onibus::all();
    }

    public function getOnibusById(int $id): ?Onibus
    {
        return Onibus::find($id);
    }

    public function createOnibus(array $data): Onibus
    {
        try {
            // Certifique-se de que todos os campos obrigatórios estão presentes
            $requiredFields = [
                'placa',
                'modelo',
                'capacidade',
                'ano_fabricacao',
                'status'
            ];
            
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    throw new \InvalidArgumentException("Campo obrigatório ausente: {$field}");
                }
            }
            
            return Onibus::create($data);
        } catch (\Exception $e) {
            throw new \RuntimeException('Falha ao criar ônibus: ' . $e->getMessage());
        }
    }

    public function updateOnibus(int $id, array $data): ?Onibus
    {
        $onibus = $this->getOnibusById($id);
        if (!$onibus) {
            return null;
        }

        try {
            $onibus->update($data);
            return $onibus->fresh();
        } catch (\Exception $e) {
            throw new \RuntimeException('Falha ao atualizar ônibus: ' . $e->getMessage());
        }
    }

    public function deleteOnibus(int $id): bool
    {
        $onibus = $this->getOnibusById($id);
        if (!$onibus) {
            return false;
        }

        return $onibus->delete();
    }

    public function getOnibusViagens(int $id): Collection
    {
        $onibus = $this->getOnibusById($id);
        if (!$onibus) {
            return collect([]);
        }

        return $onibus->viagens;
    }
}
=== /Users/micaelsantana/Documents/app-backend/routes/console.php ===

<?php

use Illuminate\Foundation\Console\ClosureCommand;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    /** @var ClosureCommand $this */
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

=== /Users/micaelsantana/Documents/app-backend/routes/web.php ===

<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});


=== /Users/micaelsantana/Documents/app-backend/routes/api.php ===

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->group(function () {
    // Test endpoint
    Route::get('/test', function () {
        return response()->json(['success' => true]);
    });

    // List of services and their respective routes
    $services = [
        'alunos' => App\Services\AlunoService::class,
        'horarios' => App\Services\HorarioService::class,
        'onibus' => App\Services\OnibusService::class,
        'paradas' => App\Services\ParadaService::class,
        'presencas' => App\Services\PresencaService::class,
        'monitores' => App\Services\MonitorService::class,
        'motoristas' => App\Services\MotoristaService::class,
        'rotas' => App\Services\RotaService::class,
        'viagens' => App\Services\ViagemService::class,
    ];

    foreach ($services as $route => $service) {
        $serviceName = class_basename($service);
        $controllerClass = 'App\\Http\\Controllers\\' . str_replace('Service', '', $serviceName) . 'Controller';

        Route::prefix($route)->group(function () use ($controllerClass, $route) {
            Route::get('/', [$controllerClass, 'index']);
            Route::post('/', [$controllerClass, 'store']);
            Route::get('/{id}', [$controllerClass, 'show']);
            Route::put('/{id}', [$controllerClass, 'update']);
            Route::delete('/{id}', [$controllerClass, 'destroy']);

            if ($route === 'rotas') {
                Route::get('/{id}/paradas', [$controllerClass, 'getParadas']);
                Route::get('/{id}/viagens', [$controllerClass, 'getViagens']);
            }
            if ($route === 'presencas') {
                Route::get('/viagem/{viagemId}', [$controllerClass, 'getPresencasByViagem']);
                Route::get('/aluno/{alunoId}', [$controllerClass, 'getPresencasByAluno']);
            }
        });
    }
});

=== /Users/micaelsantana/Documents/app-backend/database/migrations/2024_01_01_000011_create_rota_parada_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rota_parada', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rota_id')->constrained('rotas')->onDelete('cascade');
            $table->foreignId('parada_id')->constrained('paradas')->onDelete('cascade');
            $table->integer('ordem');
            $table->time('horario_estimado')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rota_parada');
    }
};

=== /Users/micaelsantana/Documents/app-backend/database/migrations/0001_01_01_000000_create_users_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};

=== /Users/micaelsantana/Documents/app-backend/database/migrations/2025_03_13_124332_create_personal_access_tokens_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};
=== /Users/micaelsantana/Documents/app-backend/database/migrations/0001_01_01_000001_create_cache_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cache');
        Schema::dropIfExists('cache_locks');
    }
};

=== /Users/micaelsantana/Documents/app-backend/database/migrations/2024_01_01_000005_create_rotas_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rotas', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->text('descricao')->nullable();
            $table->string('tipo', 50)->default('Escolar'); // Add a default value
            $table->decimal('distancia_km', 8, 2)->nullable(); // Make nullable
            $table->integer('tempo_estimado_minutos')->nullable(); // Make nullable
            $table->string('origem')->nullable(); // Add this field
            $table->string('destino')->nullable(); // Add this field
            $table->time('horario_inicio')->nullable(); // Add this field
            $table->time('horario_fim')->nullable(); // Add this field
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('rotas');
    }
};

=== /Users/micaelsantana/Documents/app-backend/database/migrations/2024_01_01_000010_create_rota_subrotas_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rota_subrotas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rota_principal_id')->constrained('rotas')->onDelete('cascade');
            $table->foreignId('subrota_id')->constrained('rotas')->onDelete('cascade');
            $table->integer('ordem');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rota_subrotas');
    }
};

=== /Users/micaelsantana/Documents/app-backend/database/migrations/2024_01_01_000004_create_monitores_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monitores', function (Blueprint $table) {
            $table->id(); // Standard Laravel auto-increment id
            $table->string('nome');
            $table->string('cpf')->unique();
            $table->string('telefone');
            $table->text('endereco');
            $table->date('data_contratacao');
            $table->enum('status', ['Ativo', 'Ferias', 'Licenca', 'Inativo']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitores');
    }
};

=== /Users/micaelsantana/Documents/app-backend/database/migrations/2024_01_01_000006_create_paradas_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paradas', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->text('endereco');
            $table->string('ponto_referencia')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->enum('tipo', ['Inicio', 'Intermediaria', 'Final']);
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paradas');
    }
};

=== /Users/micaelsantana/Documents/app-backend/database/migrations/0001_01_01_000002_create_jobs_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('failed_jobs');
    }
};

=== /Users/micaelsantana/Documents/app-backend/database/migrations/2024_01_01_000007_create_horarios_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rota_id')->constrained()->onDelete('cascade');
            $table->time('hora_saida');
            $table->time('hora_chegada');
            $table->json('dias_semana');
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horarios');
    }
};

=== /Users/micaelsantana/Documents/app-backend/database/migrations/2025_03_13_180000_add_tempo_estimado_to_rota_parada.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rota_parada', function (Blueprint $table) {
            if (!Schema::hasColumn('rota_parada', 'tempo_estimado_minutos')) {
                $table->integer('tempo_estimado_minutos')->nullable()->after('ordem');
            }
        });
    }

    public function down(): void
    {
        Schema::table('rota_parada', function (Blueprint $table) {
            $table->dropColumn('tempo_estimado_minutos');
        });
    }
};
=== /Users/micaelsantana/Documents/app-backend/database/migrations/2024_01_01_000003_create_alunos_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alunos', function (Blueprint $table) {
            $table->id(); // Standard Laravel auto-increment id
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->date('data_nascimento');
            $table->string('responsavel');
            $table->string('telefone_responsavel');
            $table->text('endereco');
            $table->string('ponto_referencia')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alunos');
    }
};

=== /Users/micaelsantana/Documents/app-backend/database/migrations/2024_01_01_000012_create_rota_aluno_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rota_aluno', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rota_id')->constrained('rotas')->onDelete('cascade');
            $table->foreignId('aluno_id')->constrained('alunos')->onDelete('cascade');
            $table->foreignId('ponto_embarque_id')->nullable()->constrained('paradas')->onDelete('set null');
            $table->foreignId('ponto_desembarque_id')->nullable()->constrained('paradas')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rota_aluno');
    }
};

=== /Users/micaelsantana/Documents/app-backend/database/migrations/2024_01_01_000002_create_motoristas_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('motoristas', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('cpf')->unique();
            $table->string('cnh');
            $table->string('categoria_cnh');
            $table->date('validade_cnh');
            $table->string('telefone');
            $table->text('endereco');
            $table->date('data_contratacao');
            $table->enum('status', ['Ativo', 'Ferias', 'Licenca', 'Inativo']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('motoristas');
    }
};
=== /Users/micaelsantana/Documents/app-backend/database/migrations/2024_01_01_000009_create_presencas_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presencas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('viagem_id')->constrained('viagens')->onDelete('cascade');
            $table->foreignId('aluno_id')->constrained('alunos')->onDelete('cascade');
            $table->boolean('presente');
            $table->time('hora_embarque')->nullable();
            $table->time('hora_desembarque')->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presencas');
    }
};

=== /Users/micaelsantana/Documents/app-backend/database/migrations/2024_01_01_000008_create_viagens_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('viagens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rota_id')->constrained('rotas');
            $table->foreignId('onibus_id')->constrained('onibus');
            $table->foreignId('motorista_id')->constrained('motoristas');
            $table->foreignId('monitor_id')->nullable()->constrained('monitores');
            $table->date('data_viagem');
            $table->time('hora_saida_real')->nullable();
            $table->time('hora_chegada_real')->nullable();
            $table->text('observacoes')->nullable();
            $table->string('status', 20);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('viagens');
    }
};

=== /Users/micaelsantana/Documents/app-backend/database/migrations/2025_03_13_172507_fix_schema_issues.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        //
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

=== /Users/micaelsantana/Documents/app-backend/database/migrations/2025_03_13_180001_add_time_columns_to_viagens.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('viagens', function (Blueprint $table) {
            $table->time('hora_chegada_prevista')->nullable()->after('data_viagem');
            $table->time('hora_saida_prevista')->nullable()->after('hora_chegada_prevista');
        });
    }

    public function down(): void
    {
        Schema::table('viagens', function (Blueprint $table) {
            $table->dropColumn(['hora_chegada_prevista', 'hora_saida_prevista']);
        });
    }
};
=== /Users/micaelsantana/Documents/app-backend/database/migrations/2024_03_13_000001_fix_schema_issues.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations to fix the schema issues based on controllers and models
     */
    public function up(): void
    {
        // Fix the horarios table schema to match controllers and models
        if (Schema::hasTable('horarios')) {
            Schema::table('horarios', function (Blueprint $table) {
                // Rename hora_saida to hora_inicio if needed
                if (Schema::hasColumn('horarios', 'hora_saida') && !Schema::hasColumn('horarios', 'hora_inicio')) {
                    $table->renameColumn('hora_saida', 'hora_inicio');
                }
                // Rename hora_chegada to hora_fim if needed
                if (Schema::hasColumn('horarios', 'hora_chegada') && !Schema::hasColumn('horarios', 'hora_fim')) {
                    $table->renameColumn('hora_chegada', 'hora_fim');
                }
                // Adicionar hora_inicio se não existir
                if (!Schema::hasColumn('horarios', 'hora_inicio') && !Schema::hasColumn('horarios', 'hora_saida')) {
                    $table->time('hora_inicio');
                }
                // Adicionar hora_fim se não existir
                if (!Schema::hasColumn('horarios', 'hora_fim') && !Schema::hasColumn('horarios', 'hora_chegada')) {
                    $table->time('hora_fim');
                }
                // Rename ativo to status if needed
                if (Schema::hasColumn('horarios', 'ativo') && !Schema::hasColumn('horarios', 'status')) {
                    $table->renameColumn('ativo', 'status');
                }
                // Adicionar status se não existir
                if (!Schema::hasColumn('horarios', 'status') && !Schema::hasColumn('horarios', 'ativo')) {
                    $table->boolean('status')->default(true);
                }
            });
        }

        // Fix the presencas table schema to match the controllers and models
        if (Schema::hasTable('presencas')) {
            Schema::table('presencas', function (Blueprint $table) {
                // Rename hora_embarque to hora_registro if needed
                if (Schema::hasColumn('presencas', 'hora_embarque') && !Schema::hasColumn('presencas', 'hora_registro')) {
                    $table->renameColumn('hora_embarque', 'hora_registro');
                }
                // Make sure hora_desembarque field is renamed or dropped
                if (Schema::hasColumn('presencas', 'hora_desembarque')) {
                    $table->dropColumn('hora_desembarque');
                }
            });
        }

        // Fix the viagens table schema to match controllers and models
        if (Schema::hasTable('viagens')) {
            // For PostgreSQL, we need to use a raw query to convert the status column
            $dbDriver = DB::connection()->getDriverName();
            
            if ($dbDriver === 'pgsql') {
                // For PostgreSQL, use explicit conversion
                if (Schema::hasColumn('viagens', 'status')) {
                    DB::statement('ALTER TABLE viagens ALTER COLUMN status TYPE boolean USING CASE WHEN status = \'1\' OR status = \'true\' OR status = \'ativo\' OR status = \'Ativo\' THEN true ELSE false END');
                    DB::statement('ALTER TABLE viagens ALTER COLUMN status SET DEFAULT true');
                }
            } else {
                // For other databases like MySQL
                Schema::table('viagens', function (Blueprint $table) {
                    if (Schema::hasColumn('viagens', 'status')) {
                        $table->boolean('status')->default(true)->change();
                    }
                });
            }
        }

        // Fix the onibus table schema to match controllers and models
        if (Schema::hasTable('onibus')) {
            // No need to change status in onibus table since it should remain a string
            // But we'll ensure it has a default value
            Schema::table('onibus', function (Blueprint $table) {
                if (Schema::hasColumn('onibus', 'status')) {
                    // The default is already set, so we don't need to change anything here
                }
            });
        }
    }

    /**
     * Reverse the migrations
     */
    public function down(): void
    {
        // No easy way to revert these changes, since they are adapting schema to match existing code
    }
};
=== /Users/micaelsantana/Documents/app-backend/database/migrations/2024_01_01_000001_create_onibus_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('onibus', function (Blueprint $table) {
            $table->id(); // Standard Laravel auto-increment id
            $table->string('placa', 10)->unique();
            $table->integer('capacidade');
            $table->string('modelo', 50);
            $table->integer('ano_fabricacao');
            $table->string('status', 20);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('onibus');
    }
};

=== /Users/micaelsantana/Documents/app-backend/database/migrations/2025_03_13_180002_add_horario_id_to_viagens_table.php ===

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('viagens', function (Blueprint $table) {
            $table->foreignId('horario_id')->constrained('horarios');
        });
    }

    public function down(): void
    {
        Schema::table('viagens', function (Blueprint $table) {
            $table->dropConstrainedForeignId('horario_id');
        });
    }
};
=== /Users/micaelsantana/Documents/app-backend/database/seeders/MonitorSeeder.php ===

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MonitorSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing data
        DB::table('monitores')->truncate();
        
        // Insert sample data
        DB::table('monitores')->insert([
            [
                'nome' => 'Ana Santos',
                'cpf' => '987.654.321-00',
                'telefone' => '+5511955555555',
                'endereco' => 'Rua Augusta, 500',
                'data_contratacao' => '2022-03-15',
                'status' => 'Ativo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'João Ferreira',
                'cpf' => '876.543.210-11',
                'telefone' => '+5511944444444',
                'endereco' => 'Av. Paulista, 400',
                'data_contratacao' => '2021-10-05',
                'status' => 'Ativo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Carla Lima',
                'cpf' => '765.432.109-22',
                'telefone' => '+5511933333333',
                'endereco' => 'Rua da Consolação, 300',
                'data_contratacao' => '2023-01-10',
                'status' => 'Ativo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

=== /Users/micaelsantana/Documents/app-backend/database/seeders/PresencaSeeder.php ===

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PresencaSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing data
        DB::table('presencas')->truncate();
        
        // Insert sample data
        DB::table('presencas')->insert([
            // Presences for Trip 1 (today)
            [
                'viagem_id' => 1,
                'aluno_id' => 1,
                'hora_registro' => '07:10',
                'presente' => true,
                'observacoes' => 'Aluno embarcou no ponto normal',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'viagem_id' => 1,
                'aluno_id' => 2,
                'hora_registro' => '07:15',
                'presente' => true,
                'observacoes' => 'Aluno embarcou no ponto normal',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'viagem_id' => 1,
                'aluno_id' => 3,
                'hora_registro' => '07:20',
                'presente' => false,
                'observacoes' => 'Aluno ausente - Doente',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Presences for Trip 2 (today)
            [
                'viagem_id' => 2,
                'aluno_id' => 4,
                'hora_registro' => '06:55',
                'presente' => true,
                'observacoes' => 'Aluno embarcou no ponto normal',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'viagem_id' => 2,
                'aluno_id' => 5,
                'hora_registro' => '07:00',
                'presente' => true,
                'observacoes' => 'Aluno embarcou no ponto normal',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

=== /Users/micaelsantana/Documents/app-backend/database/seeders/HorarioSeeder.php ===

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HorarioSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing data
        DB::table('horarios')->truncate();
        
        // Insert sample data
        DB::table('horarios')->insert([
            [
                'rota_id' => 1,
                'dias_semana' => json_encode([1, 3, 5]), // Monday, Wednesday, Friday
                'hora_inicio' => '07:00',
                'hora_fim' => '07:45',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'rota_id' => 1,
                'dias_semana' => json_encode([2, 4]), // Tuesday, Thursday
                'hora_inicio' => '07:15',
                'hora_fim' => '08:00',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'rota_id' => 2,
                'dias_semana' => json_encode([1, 2, 3, 4, 5]), // Monday through Friday
                'hora_inicio' => '06:45',
                'hora_fim' => '07:30',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'rota_id' => 3,
                'dias_semana' => json_encode([1, 2, 3, 4, 5]), // Monday through Friday
                'hora_inicio' => '06:30',
                'hora_fim' => '07:15',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
=== /Users/micaelsantana/Documents/app-backend/database/seeders/RotaSeeder.php ===

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RotaSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing data
        DB::table('rotas')->truncate();
        
        // Insert sample data
        DB::table('rotas')->insert([
            [
                'nome' => 'Rota Centro-Bairro',
                'descricao' => 'Rota que liga o centro da cidade ao bairro residencial',
                'origem' => 'Centro',
                'destino' => 'Bairro',
                'horario_inicio' => '08:00',
                'horario_fim' => '18:00',
                'tipo' => 'Escolar',
                'distancia_km' => 15.5,
                'tempo_estimado_minutos' => 45,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Rota Escola Municipal',
                'descricao' => 'Rota para a Escola Municipal',
                'origem' => 'Terminal',
                'destino' => 'Escola Municipal',
                'horario_inicio' => '07:00',
                'horario_fim' => '17:30',
                'tipo' => 'Escolar',
                'distancia_km' => 8.2,
                'tempo_estimado_minutos' => 30,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Rota Escola Estadual',
                'descricao' => 'Rota para a Escola Estadual',
                'origem' => 'Terminal',
                'destino' => 'Escola Estadual',
                'horario_inicio' => '06:30',
                'horario_fim' => '17:00',
                'tipo' => 'Escolar',
                'distancia_km' => 12.0,
                'tempo_estimado_minutos' => 40,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

=== /Users/micaelsantana/Documents/app-backend/database/seeders/OnibusSeeder.php ===

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OnibusSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing data
        DB::table('onibus')->truncate();
        
        // Insert sample data
        DB::table('onibus')->insert([
            [
                'placa' => 'ABC1D234',
                'modelo' => 'Mercedes Benz O500U',
                'capacidade' => 40,
                'ano_fabricacao' => 2020,
                'status' => 'Ativo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'placa' => 'DEF2G567',
                'modelo' => 'Volkswagen 17.230 OD',
                'capacidade' => 35,
                'ano_fabricacao' => 2019,
                'status' => 'Ativo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'placa' => 'GHI3J890',
                'modelo' => 'Mercedes Benz OF-1519',
                'capacidade' => 30,
                'ano_fabricacao' => 2021,
                'status' => 'Manutenção',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

=== /Users/micaelsantana/Documents/app-backend/database/seeders/AlunoSeeder.php ===

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlunoSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing data
        DB::table('alunos')->truncate();
        
        // Insert sample data
        DB::table('alunos')->insert([
            [
                'nome' => 'Maria Silva',
                'descricao' => 'Aluna do 5º ano',
                'data_nascimento' => '2015-03-15',
                'responsavel' => 'João Silva',
                'telefone_responsavel' => '+5511999999999',
                'endereco' => 'Rua das Flores, 123',
                'ponto_referencia' => 'Próximo ao supermercado',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Pedro Santos',
                'descricao' => 'Aluno do 3º ano',
                'data_nascimento' => '2017-05-20',
                'responsavel' => 'Ana Santos',
                'telefone_responsavel' => '+5511988888888',
                'endereco' => 'Av. Brasil, 456',
                'ponto_referencia' => 'Em frente à farmácia',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Luiza Oliveira',
                'descricao' => 'Aluna do 8º ano',
                'data_nascimento' => '2012-07-10',
                'responsavel' => 'Carlos Oliveira',
                'telefone_responsavel' => '+5511977777777',
                'endereco' => 'Rua dos Pinheiros, 789',
                'ponto_referencia' => 'Próximo à padaria',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Rafael Costa',
                'descricao' => 'Aluno do 6º ano',
                'data_nascimento' => '2014-11-25',
                'responsavel' => 'Mariana Costa',
                'telefone_responsavel' => '+5511966666666',
                'endereco' => 'Av. Paulista, 234',
                'ponto_referencia' => 'Ao lado do banco',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Julia Ferreira',
                'descricao' => 'Aluna do 4º ano',
                'data_nascimento' => '2016-09-30',
                'responsavel' => 'Roberto Ferreira',
                'telefone_responsavel' => '+5511955555555',
                'endereco' => 'Rua Augusta, 567',
                'ponto_referencia' => 'Próximo ao shopping',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

=== /Users/micaelsantana/Documents/app-backend/database/seeders/ViagemSeeder.php ===

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ViagemSeeder extends Seeder // Aqui estava incorreto como HorarioSeeder
{
    public function run(): void
    {
        // Clear existing data
        DB::table('viagens')->truncate();
        
        // Get tomorrow's date
        $tomorrow = Carbon::tomorrow()->format('Y-m-d');
        $today = Carbon::today()->format('Y-m-d');
        
        // Insert sample data
        DB::table('viagens')->insert([
            [
                'data_viagem' => $today,
                'rota_id' => 1,
                'onibus_id' => 1,
                'motorista_id' => 1,
                'monitor_id' => 1,
                'horario_id' => 1, // Ensure this matches an existing horario in the horarios table
                'hora_saida_prevista' => '07:00',
                'hora_chegada_prevista' => '07:45',
                'hora_saida_real' => '07:05',
                'hora_chegada_real' => '07:50',
                'status' => true,
                'observacoes' => 'Viagem concluída sem incidentes',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'data_viagem' => $today,
                'rota_id' => 2,
                'onibus_id' => 2,
                'motorista_id' => 2,
                'monitor_id' => 2,
                'horario_id' => 3, // Ensure this matches an existing horario in the horarios table
                'hora_saida_prevista' => '06:45',
                'hora_chegada_prevista' => '07:30',
                'hora_saida_real' => '06:50',
                'hora_chegada_real' => '07:35',
                'status' => true,
                'observacoes' => 'Atraso de 5 minutos devido ao trânsito',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'data_viagem' => $tomorrow,
                'rota_id' => 1,
                'onibus_id' => 1,
                'motorista_id' => 1,
                'monitor_id' => 1,
                'horario_id' => 1, // Ensure this matches an existing horario in the horarios table
                'hora_saida_prevista' => '07:00',
                'hora_chegada_prevista' => '07:45',
                'hora_saida_real' => null,
                'hora_chegada_real' => null,
                'status' => true,
                'observacoes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'data_viagem' => $tomorrow,
                'rota_id' => 3,
                'onibus_id' => 3,
                'motorista_id' => 3,
                'monitor_id' => 3,
                'horario_id' => 4, // Ensure this matches an existing horario in the horarios table
                'hora_saida_prevista' => '06:30',
                'hora_chegada_prevista' => '07:15',
                'hora_saida_real' => null,
                'hora_chegada_real' => null,
                'status' => true,
                'observacoes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
=== /Users/micaelsantana/Documents/app-backend/database/seeders/RotaParadaSeeder.php ===

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RotaParadaSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing data - FIXED TABLE NAME to match migration
        DB::table('rota_parada')->truncate();
        
        // Insert sample data
        DB::table('rota_parada')->insert([
            // Rota 1
            [
                'rota_id' => 1,
                'parada_id' => 1,
                'ordem' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'rota_id' => 1,
                'parada_id' => 2,
                'ordem' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'rota_id' => 1,
                'parada_id' => 5,
                'ordem' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Rota 2
            [
                'rota_id' => 2,
                'parada_id' => 2,
                'ordem' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'rota_id' => 2,
                'parada_id' => 3,
                'ordem' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'rota_id' => 2,
                'parada_id' => 1,
                'ordem' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Rota 3
            [
                'rota_id' => 3,
                'parada_id' => 4,
                'ordem' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'rota_id' => 3,
                'parada_id' => 5,
                'ordem' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'rota_id' => 3,
                'parada_id' => 1,
                'ordem' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

=== /Users/micaelsantana/Documents/app-backend/database/seeders/ParadaSeeder.php ===

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ParadaSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing data
        DB::table('paradas')->truncate();
        
        // Insert sample data
        DB::table('paradas')->insert([
            [
                'nome' => 'Escola Municipal',
                'endereco' => 'Rua da Educação, 100',
                'ponto_referencia' => 'Em frente à praça',
                'latitude' => -23.5505,
                'longitude' => -46.6333,
                'tipo' => 'Inicio',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Praça Central',
                'endereco' => 'Av. Paulista, 500',
                'ponto_referencia' => 'Próximo ao metrô',
                'latitude' => -23.5630,
                'longitude' => -46.6543,
                'tipo' => 'Intermediaria',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Parque Municipal',
                'endereco' => 'Rua das Árvores, 200',
                'ponto_referencia' => 'Entrada principal',
                'latitude' => -23.5755,
                'longitude' => -46.6424,
                'tipo' => 'Intermediaria',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Centro Comercial',
                'endereco' => 'Av. Brasil, 1000',
                'ponto_referencia' => 'Em frente ao shopping',
                'latitude' => -23.5830,
                'longitude' => -46.6382,
                'tipo' => 'Intermediaria',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Bairro Residencial',
                'endereco' => 'Rua dos Jardins, 300',
                'ponto_referencia' => 'Próximo ao supermercado',
                'latitude' => -23.5905,
                'longitude' => -46.6290,
                'tipo' => 'Final',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

=== /Users/micaelsantana/Documents/app-backend/database/seeders/MotoristaSeeder.php ===

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MotoristaSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing data
        DB::table('motoristas')->truncate();
        
        // Insert sample data
        DB::table('motoristas')->insert([
            [
                'nome' => 'Carlos Oliveira',
                'cpf' => '123.456.789-00',
                'cnh' => '12345678900',
                'categoria_cnh' => 'D',
                'validade_cnh' => '2026-05-20',
                'telefone' => '+5511977777777',
                'endereco' => 'Av. Paulista, 1000',
                'data_contratacao' => '2022-01-15',
                'status' => 'Ativo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Márcia Santos',
                'cpf' => '234.567.890-11',
                'cnh' => '23456789011',
                'categoria_cnh' => 'D',
                'validade_cnh' => '2025-11-10',
                'telefone' => '+5511966666666',
                'endereco' => 'Rua Augusta, 500',
                'data_contratacao' => '2021-08-10',
                'status' => 'Ativo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Roberto Silva',
                'cpf' => '345.678.901-22',
                'cnh' => '34567890122',
                'categoria_cnh' => 'E',
                'validade_cnh' => '2027-03-15',
                'telefone' => '+5511955555555',
                'endereco' => 'Av. Brigadeiro Faria Lima, 300',
                'data_contratacao' => '2023-02-01',
                'status' => 'Ativo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

=== /Users/micaelsantana/Documents/app-backend/database/seeders/DatabaseSeeder.php ===

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            AlunoSeeder::class,
            MotoristaSeeder::class,
            MonitorSeeder::class,
            OnibusSeeder::class,
            ParadaSeeder::class,
            RotaSeeder::class,
            RotaParadaSeeder::class,
            HorarioSeeder::class,
            ViagemSeeder::class,
            PresencaSeeder::class,
        ]);
    }
}
